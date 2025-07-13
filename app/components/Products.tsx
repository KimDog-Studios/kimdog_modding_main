"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import products from "../config/ProductsConfig";

// Firebase imports
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

function Products() {
  const router = useRouter();
  const [ownedProductIds, setOwnedProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setOwnedProductIds([]);
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "purchases", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          const ownedIds: string[] = data.ownedProductIds || [];
          setOwnedProductIds(ownedIds);
        } else {
          setOwnedProductIds([]);
        }
      } catch (err) {
        setError("Failed to load owned products.");
        console.error("Firestore error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-white p-8">Loading products...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br p-8">
      <h1 className="text-4xl text-white font-bold text-center mb-12">Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {products.map((product) => {
          const isOwned = ownedProductIds.includes(product.id);

          return (
            <div
              key={product.id}
              onClick={() => router.push(`/product/${product.id}`)}
              className="cursor-pointer bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl shadow-xl p-6 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 rounded-3xl" />

              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-xl z-10 relative"
              />

              {/* Owned badge */}
              {isOwned && (
                <div className="absolute top-4 right-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full z-20 select-none">
                  Owned
                </div>
              )}

              <div className="z-10 relative mt-4">
                <h2 className="text-xl font-semibold text-white">{product.name}</h2>
                <p className="text-gray-300 text-sm mt-1">{product.description}</p>
                <div
                  className={`font-bold text-xl mt-4 ${
                    isOwned ? "text-green-500" : "text-sky-400"
                  }`}
                >
                  {isOwned
                    ? "Owned"
                    : product.price === 0
                    ? "Free"
                    : `$${product.price.toFixed(2)}`}
                </div>

                {/* Author with blue checkmark */}
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-300">
                  <span>{product.author}</span>
                  {product.author === "KimDog Studios" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-sky-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                      aria-label="Verified author"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Products;