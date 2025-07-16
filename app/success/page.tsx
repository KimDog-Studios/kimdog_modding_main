"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import confetti from "canvas-confetti";
import { CheckCircle, XCircle } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  author: string;
  downloadUrl?: string;
  game?: string;
};

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [products, setProducts] = useState<Product[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handlePurchase = async () => {
      if (!user) return;

      try {
        const purchasesRef = collection(db, "purchases");
        const fetchedProducts: Product[] = [];

        if (sessionId) {
          // Stripe Purchase Flow
          const stripeQuery = query(purchasesRef, where("sessionId", "==", sessionId));
          const snapshot = await getDocs(stripeQuery);

          if (snapshot.empty) throw new Error("No purchase found for this session.");

          for (const docSnap of snapshot.docs) {
            const { productId } = docSnap.data();
            const productRef = doc(db, "products", productId);
            const productSnap = await getDoc(productRef);

            if (productSnap.exists()) {
              const data = productSnap.data();
              fetchedProducts.push({
                id: productId,
                name: data.name || "Untitled Mod",
                description: data.description || "No description available.",
                image: data.image || "/placeholder.png",
                price: data.price || 0,
                author: data.author || "Unknown",
                downloadUrl: data.downloadUrl || "",
                game: data.game || "",
              });
            }
          }
        } else {
          // Free Product Flow from cart doc with items array
          const cartDocRef = doc(db, "carts", user.uid);
          const cartDocSnap = await getDoc(cartDocRef);

          if (!cartDocSnap.exists()) throw new Error("Your cart is empty.");

          const cartData = cartDocSnap.data();
          const items = cartData?.items || [];

          if (items.length === 0) throw new Error("Your cart is empty.");

          for (const item of items) {
            const productId = item.productId;

            const productRef = doc(db, "products", productId);
            const productSnap = await getDoc(productRef);

            if (!productSnap.exists()) {
              console.warn(`Product ${productId} not found, skipping`);
              continue;
            }

            const data = productSnap.data();

            // Build product with exact fields needed
            const product: Product = {
              id: productId,
              name: data.name,
              description: data.description,
              image: data.image,
              price: data.price,
              author: data.author,
              downloadUrl: data.downloadUrl,
              game: data.game,
            };

            // Check if purchase already exists for this user + product
            const purchaseQuery = query(
              purchasesRef,
              where("userId", "==", user.uid),
              where("productId", "==", product.id)
            );
            const existing = await getDocs(purchaseQuery);

            if (existing.empty) {
              await addDoc(purchasesRef, {
                userId: user.uid,
                email: user.email || null,
                sessionId: "free",
                productId: product.id,
                productName: product.name,
                author: product.author,
                description: product.description,
                downloadUrl: product.downloadUrl,
                game: product.game,
                image: product.image,
                price: product.price,
                timestamp: new Date().toISOString(),
              });
            }

            fetchedProducts.push(product);
          }

          // Clear cart by setting items to empty array
          await updateDoc(cartDocRef, { items: [] });
        }

        if (fetchedProducts.length === 0) throw new Error("No valid products found.");

        setProducts(fetchedProducts);
        triggerConfetti();
        setStatus("success");
      } catch (err: any) {
        console.error("SuccessPage Error:", err.message);
        setErrorMessage(err.message || "Something went wrong.");
        setStatus("error");
      }
    };

    handlePurchase();
  }, [sessionId, user]);

  const triggerConfetti = () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ["#38bdf8", "#60a5fa", "#2563eb", "#a5b4fc"],
        });
      }, i * 400);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
      {status === "loading" && (
        <div className="text-lg animate-pulse">Loading your purchase...</div>
      )}

      {status === "error" && (
        <div className="text-red-600">
          <XCircle className="w-10 h-10 mx-auto mb-2" />
          <h2 className="text-2xl font-semibold mb-2">Oops! Something went wrong.</h2>
          <p>{errorMessage}</p>
        </div>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="text-green-600 w-12 h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Thanks for your purchase!</h1>
          <p className="mb-6 text-gray-600">
            You now own {products.length === 1 ? "this mod" : "these mods"}:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl shadow-md bg-white dark:bg-zinc-900 overflow-hidden flex flex-col transition hover:shadow-xl"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-3">
                    {product.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-auto">
                    by {product.author}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <a
            href="https://downloads.kimdog-modding.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-block bg-blue-600 hover:bg-blue-700 text-white text-base font-medium px-6 py-3 rounded-xl shadow-md transition"
          >
            Go to My Downloads
          </a>
        </>
      )}
    </div>
  );
}