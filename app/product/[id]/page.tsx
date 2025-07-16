"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Image from "next/image";
import LoadingScreen from "@/app/components/LoadingScreen";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "../../lib/firebase";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  author: string;
  image: string;
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [ownedProductIds, setOwnedProductIds] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const maxQuantity = product?.price && product.price > 0 ? 2 : 10;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const productDoc = await getDoc(doc(db, "products", productId));
        if (!productDoc.exists()) {
          notFound();
          return;
        }
        const prodData = productDoc.data() as Product;
        setProduct({ ...prodData, id: productDoc.id });
        setSelectedImage(prodData.image);
      } catch (error) {
        console.error("Failed to fetch product", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    if (productId) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setOwnedProductIds([]);
        setAuthLoading(false);
        return;
      }

      try {
        const purchasesRef = collection(db, "purchases");
        const q = query(purchasesRef, where("userId", "==", currentUser.uid));
        const snapshot = await getDocs(q);

        const ownedIds: string[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.productId) ownedIds.push(data.productId);
        });

        setOwnedProductIds(ownedIds);
      } catch (error) {
        console.error("Error fetching owned products:", error);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const isOwned = ownedProductIds.includes(productId);

  const decrement = useCallback(() => {
    setQuantity((q) => Math.max(1, q - 1));
  }, []);

  const increment = useCallback(() => {
    setQuantity((q) => {
      if (q >= maxQuantity) {
        alert(`No more than ${maxQuantity} of this product can be added`);
        return q;
      }
      return q + 1;
    });
  }, [maxQuantity]);

  const handleAddToCart = useCallback(async () => {
    if (isOwned) {
      alert("You already own this product.");
      return;
    }
    if (!product || !user) {
      alert("Please login to add to cart.");
      return;
    }

    const cartDocRef = doc(db, "carts", user.uid);

    try {
      const cartDoc = await getDoc(cartDocRef);

      let updatedItems: { productId: string; quantity: number }[] = [];

      if (cartDoc.exists()) {
        const data = cartDoc.data();
        updatedItems = data.items || [];

        const existingIndex = updatedItems.findIndex(
          (item) => item.productId === product.id
        );

        if (existingIndex > -1) {
          // Update quantity, capped by maxQuantity
          const existingItem = updatedItems[existingIndex];
          const newQuantity = Math.min(
            existingItem.quantity + quantity,
            maxQuantity
          );
          updatedItems[existingIndex] = { productId: product.id, quantity: newQuantity };
        } else {
          updatedItems.push({ productId: product.id, quantity });
        }

        await updateDoc(cartDocRef, { items: updatedItems });
      } else {
        // New cart doc
        updatedItems = [{ productId: product.id, quantity }];
        await setDoc(cartDocRef, { items: updatedItems });
      }

      // If product is free, store it for checkout special handling
      if (product.price === 0) {
        localStorage.setItem("purchasedProductId", product.id);
      }

      router.push("/cart");
    } catch (error) {
      console.error("Failed to add to cart or navigate:", error);
      alert("Failed to add to cart. Please try again.");
    }
  }, [isOwned, product, quantity, maxQuantity, router, user]);

  if (loading || authLoading) {
    return <LoadingScreen message="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="min-h-screen text-white flex justify-center items-center">
        Product not found.
      </div>
    );
  }

  const displayPrice = isOwned
    ? "Owned"
    : product.price && product.price > 0
    ? `$${product.price.toFixed(2)}`
    : "Free";

  return (
    <div className="min-h-screen text-white flex flex-col">
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
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

            {product.price && product.price > 0 && !isOwned && (
              <div className="flex items-center space-x-4 mb-4">
                <label htmlFor="quantity" className="font-semibold text-lg">
                  Quantity:
                </label>
                <div className="flex items-center border rounded-md w-28 bg-[#1e293b]">
                  <button
                    onClick={decrement}
                    className="px-4 py-2 text-lg font-bold hover:bg-sky-700 transition text-white"
                    aria-label="Decrease quantity"
                    type="button"
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
                    aria-label="Quantity"
                  />
                  <button
                    onClick={increment}
                    className="px-4 py-2 text-lg font-bold hover:bg-sky-700 transition text-white"
                    aria-label="Increase quantity"
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {isOwned ? (
            <button
              type="button"
              disabled
              className="w-full bg-gray-600 cursor-not-allowed text-white font-bold py-5 rounded-md shadow-lg transition text-lg"
            >
              You Own This Product
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full ${
                product.price && product.price > 0 ? "bg-sky-600 hover:bg-sky-700" : "bg-green-600 hover:bg-green-700"
              } text-white font-bold py-5 rounded-md shadow-lg transition text-lg`}
            >
              Add to cart
            </button>
          )}
        </section>
      </main>
    </div>
  );
}