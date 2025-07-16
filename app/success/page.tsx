"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingScreen from "../components/LoadingScreen";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  author?: string;
  image?: string;
};

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"success" | "error" | "exists" | null>(
    null
  );
  const [loaded, setLoaded] = useState(false);

  // Redirect if no user logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      setLoaded(true);
      return;
    }

    const fetchSessionAndProducts = async () => {
      try {
        // Fetch session from your backend API (server-side secret key used here)
        const res = await fetch(`/api/stripe-session?sessionId=${sessionId}`);
        if (!res.ok) throw new Error("Failed to fetch session");

        const sessionData = await res.json();

        // Stripe expands line_items with data in `line_items.data`
        const lineItems = sessionData.line_items?.data || [];

        // Map purchased products from Stripe line items
        const purchasedProducts: Product[] = lineItems.map((item: any) => ({
          id: item.price.product.id,
          name: item.description || item.price.product.name,
          price: item.amount_total
            ? item.amount_total / 100
            : item.price.unit_amount
            ? item.price.unit_amount / 100
            : undefined,
          // You can add image, author, description if you store them in Stripe metadata or your DB
          image: item.price.product.images?.[0] || undefined,
          description: item.price.product.description || undefined,
        }));

        setProducts(purchasedProducts);

        // Check if purchase already recorded in Firestore
        const purchasesRef = collection(db, "purchases");
        const purchaseQuery = query(
          purchasesRef,
          where("userId", "==", user.uid),
          where("sessionId", "==", sessionId)
        );
        const purchaseSnapshot = await getDocs(purchaseQuery);

        if (!purchaseSnapshot.empty) {
          setStatus("exists");
          setLoaded(true);
          return;
        }

        // Record purchase in Firestore
        for (const product of purchasedProducts) {
          await addDoc(purchasesRef, {
            userId: user.uid,
            email: user.email,
            sessionId,
            productId: product.id,
            productName: product.name,
            timestamp: new Date().toISOString(),
          });
        }

        setStatus("success");

        // Confetti celebration
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            confetti({
              particleCount: 300,
              spread: 100,
              origin: { y: 0.6 },
              colors: ["#38bdf8", "#60a5fa", "#2563eb", "#a5b4fc"],
            });
          }, i * 400);
        }
      } catch (error) {
        console.error("Error processing purchase:", error);
        setStatus("error");
      } finally {
        setLoaded(true);
      }
    };

    fetchSessionAndProducts();
  }, [user, searchParams]);

  if (!loaded || !user) {
    return <LoadingScreen message="Loading..." />;
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-white p-8">
        <main className="flex-grow flex flex-col justify-center items-center">
          <h1 className="text-3xl font-bold mb-4">No products found</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <main className="flex-grow max-w-4xl mx-auto p-8 flex flex-col items-center text-center">
        <motion.h1
          className={`text-5xl font-extrabold mb-6 ${
            status === "success"
              ? "text-sky-400"
              : status === "exists"
              ? "text-yellow-400"
              : "text-red-400"
          }`}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {status === "success" && "🎉 Thank you for your purchase!"}
          {status === "exists" && "✅ You already own this product(s)"}
          {status === "error" && "❌ Error processing your purchase"}
        </motion.h1>

        {products.map((product) => (
          <motion.div
            key={product.id}
            className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-xl flex flex-col md:flex-row items-center text-left mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-32 h-32 object-cover rounded-xl mb-4 md:mb-0 md:mr-6 border border-gray-700"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {product.name}
              </h2>
              {product.author && (
                <p className="text-sm text-gray-400 mb-1">By {product.author}</p>
              )}
              <p className="text-base text-gray-300">
                {product.description || "No description available."}
              </p>
            </div>
          </motion.div>
        ))}

        <motion.button
          onClick={() =>
            window.open("https://downloads.kimdog-modding.co.uk/", "_blank")
          }
          className="mt-8 px-10 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-semibold text-lg transition"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Go to Library
        </motion.button>
      </main>
    </div>
  );
}
