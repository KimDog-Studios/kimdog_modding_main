"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useCart } from "../components/CartContext"; // adjust path to your CartContext
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase"; // adjust path to your firebase config
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";

const PURPLE = "#6a0dad";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface DiscountCodeProps {
  onApply: (discountPercent: number) => void;
  disabled?: boolean;
}

function DiscountCode({ onApply, disabled = false }: DiscountCodeProps) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const applyDiscount = () => {
    const c = code.trim().toLowerCase();
    if (!c) {
      setMessage("Please enter a discount code.");
      onApply(0);
      return;
    }
    // Example discount codes:
    if (c === "free") {
      onApply(100);
      setMessage("100% discount applied!");
    } else if (c === "half") {
      onApply(50);
      setMessage("50% discount applied!");
    } else if (c === "quarter") {
      onApply(25);
      setMessage("25% discount applied!");
    } else {
      onApply(0);
      setMessage("Invalid discount code.");
    }
  };

  return (
    <div
      style={{
        marginBottom: 24,
        display: "flex",
        gap: 12,
        alignItems: "center",
        userSelect: "none",
      }}
    >
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter discount code"
        disabled={disabled}
        style={{
          flexGrow: 1,
          padding: "12px 16px",
          fontSize: 16,
          borderRadius: 12,
          border: "1px solid #ccc",
          fontWeight: "600",
          userSelect: "text",
        }}
        aria-label="Discount code input"
      />
      <button
        onClick={applyDiscount}
        disabled={disabled}
        style={{
          background: PURPLE,
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "12px 20px",
          fontWeight: "700",
          fontSize: 16,
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: `4px 4px 6px ${PURPLE}cc, -4px -4px 6px #ffffff55`,
          userSelect: "none",
        }}
        aria-label="Apply discount code"
      >
        Apply
      </button>
      {message && (
        <span
          style={{
            marginLeft: 8,
            color: message.includes("Invalid") ? "red" : "green",
            fontWeight: "700",
          }}
          role="alert"
        >
          {message}
        </span>
      )}
    </div>
  );
}

export default function CartPage() {
  const { items, setItemQuantity, removeItem, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

  const fetchProducts = useCallback(async () => {
    if (items.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetchedProducts = await Promise.all(
        items.map(async (cartItem) => {
          const docRef = doc(db, "products", cartItem.productId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { ...(docSnap.data() as Product), id: cartItem.productId };
          }
          return null;
        })
      );
      setProducts(fetchedProducts.filter((p): p is Product => p !== null));
    } catch (error) {
      console.error("Error fetching product details:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [items]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function handleCheckout() {
    if (items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setCheckoutLoading(true);

    // Check if any paid products exist (price > 0)
    const hasPaidItems = products.some(
      (p) => items.find((i) => i.productId === p.id)?.quantity && p.price > 0
    );

    try {
      if (hasPaidItems) {
        // Stripe checkout for paid items
        const res = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map(({ productId, quantity }) => ({
              id: productId,
              quantity,
            })),
            discountPercent,
            success_url: `${window.location.origin}/success`,
            cancel_url: `${window.location.origin}/cart`,
          }),
        });

        const data = await res.json();

        if (data.error) {
          alert(data.error);
          setCheckoutLoading(false);
          return;
        }

        const stripe = await stripePromise;
        if (!stripe) {
          alert("Stripe failed to load");
          setCheckoutLoading(false);
          return;
        }

        const { error } = await stripe.redirectToCheckout({
          sessionId: data.id,
        });

        if (error) {
          alert(error.message);
        }
      } else {
        // All free items, skip Stripe and go to success page
        window.location.href = "/success";
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to initiate checkout");
    } finally {
      setCheckoutLoading(false);
    }
  }

  // Calculate subtotal for paid items only
  const subtotal = products.reduce((acc, product) => {
    if (product.price === 0) return acc; // skip free products from subtotal
    const quantity = items.find((i) => i.productId === product.id)?.quantity || 0;
    return acc + product.price * quantity;
  }, 0);

  const discountAmount = (subtotal * discountPercent) / 100;
  const totalAfterDiscount = subtotal - discountAmount;

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "50px auto",
        padding: "0 24px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        position: "relative",
      }}
    >
      <h1
        style={{
          fontWeight: "900",
          fontSize: 36,
          color: "#222",
          marginBottom: 32,
          userSelect: "none",
        }}
      >
        Your Cart
      </h1>

      <DiscountCode onApply={setDiscountPercent} disabled={checkoutLoading} />

      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "#fff",
          padding: "12px 0",
          marginBottom: 24,
          display: "flex",
          gap: 12,
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          borderRadius: 12,
          zIndex: 10,
          userSelect: "none",
        }}
      >
        <button
          onClick={clearCart}
          style={{
            background: PURPLE,
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "12px 20px",
            fontWeight: "700",
            fontSize: 16,
            cursor: items.length === 0 || checkoutLoading ? "not-allowed" : "pointer",
            boxShadow: `4px 4px 6px ${PURPLE}cc, -4px -4px 6px #ffffff55`,
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!(items.length === 0 || checkoutLoading))
              e.currentTarget.style.background = "#580a9d";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = PURPLE;
          }}
          disabled={items.length === 0 || checkoutLoading}
          aria-label="Clear all items from cart"
        >
          Clear Cart
        </button>

        <button
          onClick={fetchProducts}
          style={{
            background: "#3a3a3a",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "12px 20px",
            fontWeight: "700",
            fontSize: 16,
            cursor: loading || checkoutLoading ? "wait" : "pointer",
            boxShadow: `4px 4px 6px #000000cc, -4px -4px 6px #55555555`,
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!(loading || checkoutLoading)) e.currentTarget.style.background = "#222";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#3a3a3a";
          }}
          disabled={loading || checkoutLoading}
          aria-label="Refresh cart data"
        >
          {loading ? "Refreshing..." : "Refresh Cart"}
        </button>

        <button
          onClick={handleCheckout}
          disabled={checkoutLoading || loading || items.length === 0}
          style={{
            background: PURPLE,
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "12px 24px",
            fontWeight: "900",
            fontSize: 18,
            cursor:
              checkoutLoading || loading || items.length === 0
                ? "not-allowed"
                : "pointer",
            boxShadow: `6px 6px 8px ${PURPLE}cc, -6px -6px 8px #ffffff55`,
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!(checkoutLoading || loading || items.length === 0))
              e.currentTarget.style.background = "#580a9d";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = PURPLE;
          }}
          aria-label="Proceed to checkout"
        >
          {checkoutLoading ? "Processing..." : "Checkout"}
        </button>
      </div>

      {loading ? (
        <div
          style={{
            height: "60vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 18,
            color: "#888",
            fontWeight: "600",
          }}
        >
          Loading your cart...
        </div>
      ) : products.length === 0 ? (
        <div
          style={{
            height: "60vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 22,
            fontWeight: "700",
            color: "#555",
          }}
        >
          Your cart is empty
        </div>
      ) : (
        <>
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ listStyle: "none", padding: 0, margin: 0 }}
          >
            <AnimatePresence>
              {products.map((product) => {
                const quantity =
                  items.find((i) => i.productId === product.id)?.quantity || 0;

                const isFree = product.price === 0;

                return (
                  <motion.li
                    key={product.id}
                    variants={itemVariants}
                    whileHover="hover"
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: 15, transition: { duration: 0.3 } }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 24,
                      marginBottom: 32,
                      padding: 20,
                      borderRadius: 18,
                      background: isFree
                        ? "linear-gradient(145deg, #e0ffe0, #cde1cd)"
                        : "linear-gradient(145deg, #f0f0f3, #cacde1)",
                      boxShadow: isFree
                        ? "8px 8px 16px #a8d5a8, -8px -8px 16px #d0efd0"
                        : "8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      width={140}
                      height={100}
                      style={{
                        borderRadius: 14,
                        objectFit: "cover",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        userSelect: "none",
                      }}
                      loading="lazy"
                    />

                    <div
                      style={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <h3
                        style={{
                          fontWeight: "900",
                          fontSize: 20,
                          marginBottom: 4,
                          userSelect: "none",
                          color: "#222",
                        }}
                      >
                        {product.name}
                        {isFree && (
                          <span
                            style={{
                              marginLeft: 8,
                              fontWeight: "700",
                              fontSize: 14,
                              color: "green",
                            }}
                          >
                            (Free)
                          </span>
                        )}
                      </h3>

                      <p
                        style={{
                          fontWeight: "700",
                          fontSize: 18,
                          color: isFree ? "green" : "#444",
                          marginBottom: 12,
                          userSelect: "none",
                        }}
                      >
                        Price: {isFree ? "Free" : `$${product.price.toFixed(2)}`}
                      </p>

                      <label
                        htmlFor={`quantity-${product.id}`}
                        style={{ fontWeight: "600", marginBottom: 4 }}
                      >
                        Quantity:
                      </label>
                      <input
                        id={`quantity-${product.id}`}
                        type="number"
                        min={1}
                        max={isFree ? 1 : 99}
                        step={1}
                        value={quantity}
                        onChange={(e) => {
                          const val = Math.max(
                            1,
                            Math.min(Number(e.target.value), isFree ? 1 : 99)
                          );
                          setItemQuantity(product.id, val);
                        }}
                        disabled={checkoutLoading || loading || isFree}
                        style={{
                          width: 60,
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "1px solid #ccc",
                          fontWeight: "700",
                          fontSize: 16,
                          cursor: isFree ? "not-allowed" : "auto",
                          backgroundColor: isFree ? "#eee" : "white",
                          userSelect: "none",
                        }}
                        aria-label={`Quantity for ${product.name}`}
                      />

                      <button
                        onClick={() => removeItem(product.id)}
                        disabled={checkoutLoading || loading}
                        style={{
                          marginTop: 12,
                          background: "#e53935",
                          border: "none",
                          color: "white",
                          padding: "8px 14px",
                          fontWeight: "700",
                          borderRadius: 12,
                          cursor: "pointer",
                          width: 110,
                        }}
                        aria-label={`Remove ${product.name} from cart`}
                      >
                        Remove
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>

          <div
            style={{
              marginTop: 24,
              textAlign: "right",
              fontWeight: "700",
              fontSize: 18,
              color: "#222",
            }}
          >
            <p style={{ margin: 0 }}>
              Subtotal: ${subtotal.toFixed(2)}
            </p>
            {discountPercent > 0 && (
              <>
                <p style={{ margin: 0, color: "green" }}>
                  Discount ({discountPercent}%): -${discountAmount.toFixed(2)}
                </p>
                <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: "900" }}>
                  Total: ${totalAfterDiscount.toFixed(2)}
                </p>
              </>
            )}
          </div>
        </>
      )}
    </main>
  );
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.03 },
};