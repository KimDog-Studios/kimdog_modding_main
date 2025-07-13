"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/app/components/NavBar";
import confetti from "canvas-confetti";
import products from "../../config/ProductsConfig";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";

export default function ThankYouPage() {
  const router = useRouter();
  const [productId, setProductId] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  // Monitor auth state
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

  // Load productId and save purchase when user and productId are ready
  useEffect(() => {
    if (!user) return; // Wait for user to be loaded

    const storedId = localStorage.getItem("purchasedProductId");

    if (storedId) {
      setProductId(storedId);
      const foundProduct = products.find((p) => p.id === storedId);
      if (foundProduct) {
        setProduct(foundProduct);

        // Confetti animation 5 times
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

        // Save entire product data to Firestore
        const saveToFirestore = async () => {
          try {
            await addDoc(collection(db, "purchases"), {
              userId: user.uid,
              email: user.email,
              timestamp: new Date().toISOString(),
              ...foundProduct, // Spread all product properties here
            });
            setStatus("success");
          } catch (error) {
            console.error("Error saving purchase:", error);
            setStatus("error");
          }
        };

        saveToFirestore();
      }
      localStorage.removeItem("purchasedProductId");
    }

    setTimeout(() => setLoaded(true), 200);
  }, [user]);

  if (!loaded || !user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white text-gray-900">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white text-gray-900 p-8">
        <NavBar />
        <h1 className="text-3xl font-bold mb-4">No product found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <NavBar />
      <main className="flex-grow max-w-4xl mx-auto p-8 flex flex-col items-center text-center">
        <h1 className="text-5xl font-extrabold mb-6 text-sky-600">
          Thank you for your purchase!
        </h1>
        <p className="text-lg mb-4">
          Your product{" "}
          <span className="font-semibold">{product.name}</span> has been
          successfully added to your library.
        </p>

        {status === "success" && (
          <p className="text-green-600 font-medium mb-4">
            Successfully saved to your account!
          </p>
        )}
        {status === "error" && (
          <p className="text-red-600 font-medium mb-4">
            Something went wrong saving to the database.
          </p>
        )}

        <button
          onClick={() =>
            window.open("https://downloads.kimdog-modding.co.uk/", "_blank")
          }
          className="mt-4 px-10 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-semibold text-lg transition"
        >
          Go to Library
        </button>
      </main>
    </div>
  );
}
