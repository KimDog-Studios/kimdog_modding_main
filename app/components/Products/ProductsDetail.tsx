"use client";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import products from "../../config/ProductsConfig";
import LoadingScreen from "../LoadingScreen";

import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [ownedProductIds, setOwnedProductIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<User | null>(null);

  const product = products.find((p) => p.id.toString() === id);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setOwnedProductIds([]);
        setLoading(false);
        return;
      }

      try {
        const purchasesRef = collection(db, "purchases");
        const q = query(purchasesRef, where("userId", "==", currentUser.uid));
        const snapshot = await getDocs(q);

        const ownedIds: string[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.id) {
            ownedIds.push(data.id);
          }
        });

        setOwnedProductIds(ownedIds);
      } catch (err) {
        setError("Failed to load owned products.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingScreen message="Loading product details..." />;

  if (!product) {
    return (
      <div className="text-center text-white mt-20">
        <p>Product not found.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-blue-400 underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isOwned = ownedProductIds.includes(product.id);

  const handleAddToCart = () => {
    if (isOwned) {
      alert("You already own this product.");
      return;
    }
    if (product.price === 0) {
      navigate("/thankyou");
    } else {
      // TODO: implement actual cart addition logic here
      alert(`Added ${quantity} of ${product.name} to cart.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br text-white p-8">
      <button
        onClick={() => navigate("/")}
        className="text-blue-400 underline mb-8 block"
      >
        ← Back to Products
      </button>

      <div className="max-w-4xl mx-auto bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl shadow-xl p-6">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover rounded-2xl mb-6"
        />
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-300 text-md mb-4">{product.description}</p>
        <div className="text-sky-400 font-bold text-2xl mb-6">
          {product.price === 0 ? "Free" : `$${product.price.toFixed(2)}`}
        </div>

        {/* Quantity selector (optional) */}
        <div className="mb-4">
          <label htmlFor="quantity" className="block text-sm mb-1">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            max={10}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.min(10, Math.max(1, Number(e.target.value))))
            }
            className="w-20 text-black rounded px-2 py-1"
            disabled={isOwned}
          />
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOwned}
          className={`px-6 py-2 rounded-xl transition ${
            isOwned
              ? "bg-gray-600 cursor-not-allowed text-gray-400"
              : "bg-sky-500 hover:bg-sky-600 text-white"
          }`}
        >
          {isOwned ? "Owned" : product.price === 0 ? "Get for Free" : "Add to Cart"}
        </button>

        {isOwned && (
          <p className="mt-4 text-green-400 font-semibold">
            You already own this product.
          </p>
        )}

        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
}

export default ProductDetail;