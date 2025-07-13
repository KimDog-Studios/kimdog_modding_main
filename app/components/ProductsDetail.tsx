"use client";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import products from "../config/ProductsConfig";
import LoadingScreen from "./LoadingScreen";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setLoading(false), 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading product details..." />;
  }

  const product = products.find((p) => p.id.toString() === id);

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
        <div className="text-sky-400 font-bold text-2xl">
          ${product.price.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
