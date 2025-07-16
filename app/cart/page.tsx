"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useCart } from "../components/CartContext"; // adjust path
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
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

interface DiscountCodeProps {
  onApply: (discountPercent: number) => void;
  disabled?: boolean;
}

function DiscountCode({ onApply, disabled = false }: DiscountCodeProps) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const applyCode = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const codesRef = collection(db, "discount_codes");
      const q = query(codesRef, where("code", "==", code.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setMessage("Invalid discount code.");
        onApply(0);
      } else {
        const doc = querySnapshot.docs[0];
        const data = doc.data();

        if (typeof data.Percentage === "number" && data.Percentage > 0) {
          setMessage(`Discount code applied: ${data.Percentage}% off!`);
          onApply(data.Percentage);
        } else {
          setMessage("Invalid discount code data.");
          onApply(0);
        }
      }
    } catch (error) {
      console.error("Error validating discount code:", error);
      setMessage("Failed to validate discount code.");
      onApply(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 24, userSelect: "none" }}>
      <label
        htmlFor="discountCode"
        style={{ fontWeight: "700", fontSize: 16, marginRight: 12 }}
      >
        Discount Code:
      </label>
      <input
        id="discountCode"
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={disabled || loading}
        placeholder="Enter code"
        style={{
          padding: "8px 12px",
          fontSize: 16,
          borderRadius: 8,
          border: "1.5px solid #ccc",
          marginRight: 8,
          width: 160,
        }}
      />
      <button
        onClick={applyCode}
        disabled={disabled || loading || code.trim() === ""}
        style={{
          backgroundColor: PURPLE,
          color: "#fff",
          fontWeight: "700",
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          cursor: disabled || loading || code.trim() === "" ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Applying..." : "Apply"}
      </button>

      {message && (
        <p
          style={{
            marginTop: 8,
            fontWeight: "600",
            color:
              message.includes("Invalid") || message.includes("Failed")
                ? "red"
                : "green",
          }}
          role="alert"
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default function CartPage() {
  const { items, setItemQuantity, removeItem, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Discount state
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
    try {
      // Pass discount percent to backend if needed
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ productId, quantity }) => ({
            id: productId,
            quantity,
          })),
          discountPercent, // send discount to backend
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

  // Calculate total with discount
  const subtotal = products.reduce((acc, product) => {
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

      {/* Discount code input */}
      <DiscountCode onApply={setDiscountPercent} disabled={checkoutLoading} />

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
                const quantity =
                  items.find((i) => i.productId === product.id)?.quantity || 0;

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
                      </h3>

                      <p
                        style={{
                          fontWeight: "700",
                          fontSize: 18,
                          color: "#444",
                          marginBottom: 12,
                          userSelect: "none",
                        }}
                      >
                        Price: ${product.price.toFixed(2)}
                      </p>

                      {/* Quantity input */}
                      <label
                        htmlFor={`quantity-${product.id}`}
                        style={{ fontWeight: "700", fontSize: 16, marginBottom: 6 }}
                      >
                        Quantity:
                      </label>
                      <input
                        id={`quantity-${product.id}`}
                        type="number"
                        min={1}
                        max={100}
                        step={1}
                        value={quantity}
                        onChange={(e) => {
                          const val = Math.min(
                            100,
                            Math.max(1, Number(e.target.value))
                          );
                          setItemQuantity(product.id, val);
                        }}
                        style={{
                          width: 70,
                          borderRadius: 10,
                          padding: "8px 12px",
                          fontSize: 18,
                          fontWeight: "900",
                          border: "2px solid #6a0dad",
                          backgroundColor: "#f9f6ff",
                          color: "#3a0ca3",
                          userSelect: "none",
                          boxShadow: "0 0 8px rgba(106, 13, 173, 0.3)",
                          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                        }}
                        aria-label={`Set quantity for ${product.name}`}
                      />
                    </div>

                    <button
                      onClick={() => removeItem(product.id)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 12,
                        alignSelf: "flex-start",
                        color: PURPLE,
                        fontWeight: "900",
                        fontSize: 20,
                        userSelect: "none",
                      }}
                      aria-label={`Remove ${product.name} from cart`}
                      title={`Remove ${product.name}`}
                    >
                      &times;
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>

          <div
            style={{
              fontWeight: "700",
              fontSize: 24,
              color: "#222",
              marginTop: 24,
              userSelect: "none",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              textAlign: "right",
            }}
          >
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            {discountPercent > 0 && (
              <>
                <p style={{ color: "green" }}>
                  Discount ({discountPercent}%): -${discountAmount.toFixed(2)}
                </p>
                <p
                  style={{
                    fontWeight: "900",
                    fontSize: 28,
                    color: PURPLE,
                  }}
                >
                  Total: ${totalAfterDiscount.toFixed(2)}
                </p>
              </>
            )}
            {discountPercent === 0 && (
              <p
                style={{
                  fontWeight: "900",
                  fontSize: 28,
                  color: PURPLE,
                }}
              >
                Total: ${subtotal.toFixed(2)}
              </p>
            )}
          </div>
        </>
      )}
    </main>
  );
}

// Animation variants for framer-motion
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.02 },
};