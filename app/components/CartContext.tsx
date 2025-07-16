"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

import { auth, db } from "../lib/firebase";

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setItemQuantity: (productId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function loadCart(uid: string) {
      try {
        const cartRef = doc(db, "carts", uid);
        const cartSnap = await getDoc(cartRef);
        if (cartSnap.exists()) {
          const data = cartSnap.data();
          setItems(data.items || []);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    }

    if (user) {
      loadCart(user.uid);
    } else {
      setItems([]);
    }
  }, [user]);

  async function saveCart(uid: string, newItems: CartItem[]) {
    try {
      const cartRef = doc(db, "carts", uid);
      await setDoc(cartRef, { items: newItems }, { merge: true });
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }

  async function updateItems(newItems: CartItem[]) {
    setItems(newItems);
    if (user) {
      await saveCart(user.uid, newItems);
    }
  }

  async function addItem(item: CartItem) {
    if (!user) {
      console.warn("User not logged in - can't save cart");
      return;
    }
    const existingIndex = items.findIndex((i) => i.productId === item.productId);
    let updatedItems: CartItem[];

    if (existingIndex !== -1) {
      updatedItems = [...items];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + item.quantity,
      };
    } else {
      updatedItems = [...items, item];
    }

    await updateItems(updatedItems);
  }

  async function setItemQuantity(productId: string, quantity: number) {
    if (!user) {
      console.warn("User not logged in - can't save cart");
      return;
    }
    if (quantity < 1) return;

    const updatedItems = items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    await updateItems(updatedItems);
  }

  async function removeItem(productId: string) {
    if (!user) {
      console.warn("User not logged in - can't save cart");
      return;
    }

    const updatedItems = items.filter((item) => item.productId !== productId);
    await updateItems(updatedItems);
  }

  async function clearCart() {
    if (!user) {
      console.warn("User not logged in - can't save cart");
      return;
    }

    setItems([]);
    try {
      const cartRef = doc(db, "carts", user.uid);
      await setDoc(cartRef, { items: [] });
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  }

  if (loading) return null;

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, setItemQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}