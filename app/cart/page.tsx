"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useCart } from "../components/CartContext"; // adjust path
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase"; // adjust path
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

interface CartItemType {
  productId: string;
  quantity: number;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: { scale: 1.03, boxShadow: `0 10px 20px ${PURPLE}55` },
};

export default function CartPage() {
  const { items, setItemQuantity, removeItem, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ productId, quantity }) => ({
            id: productId,
            quantity,
          })),
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
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to initiate checkout");
    } finally {
      setCheckoutLoading(false);
    }
  }

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

      {/* Sticky buttons bar always visible */}
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
            if (!(items.length === 0 || checkoutLoading)) e.currentTarget.style.background = "#580a9d";
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
            cursor: checkoutLoading || loading || items.length === 0 ? "not-allowed" : "pointer",
            boxShadow: `6px 6px 8px ${PURPLE}cc, -6px -6px 8px #ffffff55`,
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!(checkoutLoading || loading || items.length === 0)) e.currentTarget.style.background = "#580a9d";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = PURPLE;
          }}
          aria-label="Proceed to checkout"
        >
          {checkoutLoading ? "Processing..." : "Checkout"}
        </button>
      </div>

      {/* Cart content or empty message */}
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
                const quantity = items.find((i) => i.productId === product.id)?.quantity || 0;

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
                      background: "linear-gradient(145deg, #f0f0f3, #cacde1)",
                      boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
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
                      draggable={false}
                    />

                    <div style={{ flexGrow: 1 }}>
                      <h2
                        style={{
                          fontWeight: "800",
                          fontSize: 22,
                          marginBottom: 8,
                          color: "#2c3e50",
                        }}
                      >
                        {product.name}
                      </h2>
                      <p
                        style={{
                          fontWeight: "600",
                          color: "#34495e",
                          marginBottom: 10,
                          fontSize: 16,
                        }}
                      >
                        Price:{" "}
                        <span style={{ color: PURPLE, fontWeight: "900" }}>
                          ${product.price.toFixed(2)}
                        </span>
                      </p>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontWeight: "700",
                          fontSize: 15,
                          color: "#34495e",
                        }}
                      >
                        Quantity:
                        <motion.input
                          type="number"
                          value={quantity}
                          min={1}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= 1) setItemQuantity(product.id, val);
                          }}
                          style={{
                            width: 72,
                            marginLeft: 14,
                            padding: "8px 14px",
                            borderRadius: 12,
                            border: "none",
                            fontWeight: "700",
                            fontSize: 16,
                            fontFamily:
                              "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                            background: "linear-gradient(145deg, #dbe2f1, #f7fbff)",
                            boxShadow:
                              "inset 6px 6px 8px #bec9e0, inset -6px -6px 8px #ffffff",
                            outline: "none",
                            userSelect: "none",
                          }}
                          disabled={checkoutLoading}
                          aria-label={`Change quantity of ${product.name}`}
                        />
                      </label>
                    </div>

                    <button
                      aria-label={`Remove ${product.name} from cart`}
                      onClick={() => removeItem(product.id)}
                      disabled={checkoutLoading}
                      style={{
                        background: "#ff4d6d",
                        color: "#fff",
                        fontWeight: "900",
                        fontSize: 18,
                        borderRadius: 12,
                        border: "none",
                        padding: "10px 18px",
                        cursor: "pointer",
                        boxShadow: "4px 4px 8px #d83858, -4px -4px 8px #ff7191",
                        userSelect: "none",
                        alignSelf: "start",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#cc3b5e")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#ff4d6d")}
                    >
                      &times;
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>

          {/* Total price */}
          <p
            style={{
              fontWeight: "800",
              fontSize: 28,
              textAlign: "right",
              marginTop: 32,
              userSelect: "none",
            }}
          >
            Total:{" "}
            <span style={{ color: PURPLE }}>
              $
              {products
                .reduce((acc, product) => {
                  const quantity = items.find((i) => i.productId === product.id)?.quantity || 0;
                  return acc + product.price * quantity;
                }, 0)
                .toFixed(2)}
            </span>
          </p>
        </>
        
      )}
    </main>
  );
}