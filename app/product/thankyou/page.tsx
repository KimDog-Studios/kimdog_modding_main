"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "../../components/LoadingScreen"; // Added import
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";

type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  author?: string;
  image?: string;
};

export default function ThankYouPage() {
  const router = useRouter();
  const [productId, setProductId] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"success" | "error" | "exists" | null>(
    null
  );

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
    const storedId = localStorage.getItem("purchasedProductId");
    if (storedId) {
      setProductId(storedId);
    } else {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!user || !productId) return;

    const fetchProductAndSavePurchase = async () => {
      try {
        const productsRef = collection(db, "products");
        const productQuery = query(productsRef, where("id", "==", productId));
        const productSnapshot = await getDocs(productQuery);

        if (productSnapshot.empty) {
          setStatus("error");
          setLoaded(true);
          return;
        }

        const productData = productSnapshot.docs[0].data() as Product;
        setProduct(productData);

        const purchasesRef = collection(db, "purchases");
        const purchaseQuery = query(
          purchasesRef,
          where("userId", "==", user.uid),
          where("id", "==", productId)
        );
        const purchaseSnapshot = await getDocs(purchaseQuery);

        if (!purchaseSnapshot.empty) {
          setStatus("exists");
          setLoaded(true);
          localStorage.removeItem("purchasedProductId");
          return;
        }

        await addDoc(purchasesRef, {
          userId: user.uid,
          email: user.email,
          timestamp: new Date().toISOString(),
          ...productData,
        });

        setStatus("success");
        localStorage.removeItem("purchasedProductId");

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
        console.error("Error fetching product or saving purchase:", error);
        setStatus("error");
      } finally {
        setLoaded(true);
      }
    };

    fetchProductAndSavePurchase();
  }, [user, productId]);

  if (!loaded || !user) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-white p-8">
        <main className="flex-grow flex flex-col justify-center items-center">
          <h1 className="text-3xl font-bold mb-4">No product found</h1>
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
          {status === "exists" && "✅ You already own this product"}
          {status === "error" && "❌ Error processing your purchase"}
        </motion.h1>

        <motion.p
          className="text-lg mb-6 text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your product <span className="font-semibold">{product.name}</span>{" "}
          {status === "exists"
            ? "is already in your library."
            : status === "success"
            ? "has been successfully added to your library."
            : "could not be added to your library."}
        </motion.p>

        {/* Animated Product Card */}
        <motion.div
          className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-xl flex flex-col md:flex-row items-center text-left"
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
              <p className="text-sm text-gray-400 mb-1">
                By {product.author}
              </p>
            )}
            <p className="text-base text-gray-300">
              {product.description || "No description available."}
            </p>
          </div>
        </motion.div>

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
