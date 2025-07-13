"use client";
import React, { useState, useEffect } from "react";
import products from "../../config/ProductsConfig";
import Image from "next/image";
import { notFound } from "next/navigation";
import NavBar from "@/app/components/NavBar";
import CircularProgress from "@mui/material/CircularProgress";

interface ProductPageProps {
  params: {
    id: string;
  };
}

function LoadingScreen() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen space-y-4 text-white">
      <CircularProgress color="primary" />
      <span className="text-lg font-medium">Loading product details...</span>
    </div>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    return notFound();
  }

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    const fallbackTimer = setTimeout(() => setLoading(false), 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = product.price > 0 ? 2 : 10;

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => {
    setQuantity((q) => {
      if (q >= maxQuantity) {
        alert(`No more than ${maxQuantity} of this product can be added`);
        return q;
      }
      return q + 1;
    });
  };

  const displayPrice = product.price > 0 ? `$${product.price.toFixed(2)}` : "Free";

  // Outer wrapper with background + min height and nav always rendered here
  return (
    <div className="min-h-screen text-white flex flex-col">
      <NavBar />

      {/* Main content or loading screen */}
      {loading ? (
        <LoadingScreen />
      ) : (
        <main className="flex-grow max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Product images */}
          <div>
            <div className="border rounded-lg overflow-hidden shadow-lg">
              <Image
                src={selectedImage}
                alt={product.name}
                width={600}
                height={600}
                className="object-cover w-full h-full"
                priority
              />
            </div>

            <div className="flex mt-4 space-x-4">
              {[product.image].map((img, i) => (
                <button
                  key={i}
                  className={`w-20 h-20 rounded-md border ${
                    selectedImage === img ? "border-sky-500" : "border-gray-700"
                  } overflow-hidden focus:outline-none transition`}
                  onClick={() => setSelectedImage(img)}
                  aria-label={`Select image ${i + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product details */}
          <section className="flex flex-col gap-8">
            <div>
              <h1 className="text-5xl font-extrabold mb-4">{product.name}</h1>
              <p className="text-2xl text-sky-400 font-semibold mb-1">{displayPrice}</p>

              <div className="flex items-center space-x-2 text-sm text-gray-300 mb-6">
                <span>Made By: {product.author}</span>
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

              <p className="text-gray-300 mb-8 leading-relaxed">{product.description}</p>

              <div className="flex items-center space-x-4 mb-4">
                <label htmlFor="quantity" className="font-semibold text-lg">
                  Quantity:
                </label>
                <div className="flex items-center border rounded-md w-28 bg-[#1e293b]">
                  <button
                    onClick={decrement}
                    className="px-4 py-2 text-lg font-bold hover:bg-sky-700 transition text-white"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    className="w-20 text-center bg-transparent outline-none text-white py-2"
                    value={quantity}
                    min={1}
                    max={maxQuantity}
                    onChange={(e) => {
                      let val = Number(e.target.value) || 1;
                      if (val > maxQuantity) {
                        alert(`No more than ${maxQuantity} of this product can be added`);
                        val = maxQuantity;
                      }
                      val = Math.max(1, val);
                      setQuantity(val);
                    }}
                  />
                  <button
                    onClick={increment}
                    className="px-4 py-2 text-lg font-bold hover:bg-sky-700 transition text-white"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-5 rounded-md shadow-lg transition text-lg"
            >
              Add to cart
            </button>
          </section>
        </main>
      )}
    </div>
  );
}
