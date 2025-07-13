"use client";
import React, { useEffect, useState } from "react";
import Products from "./Products"; // path to your Products component
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

type PurchaseDoc = {
  productId: string;
  userId: string;
};

type Props = {
  userId: string;
};

export default function ProductsWrapper({ userId }: Props) {
  const [ownedProductIds, setOwnedProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchOwnedProducts() {
      setLoading(true);
      try {
        const purchasesRef = collection(db, "purchases");
        const q = query(purchasesRef, where("userId", "==", userId));
        const snapshot = await getDocs(q);

        const productIds: string[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as PurchaseDoc;
          if (data.productId) productIds.push(data.productId);
        });

        setOwnedProductIds(productIds);
      } catch (error) {
        console.error("Error fetching owned products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOwnedProducts();
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center text-gray-600 text-xl mt-10">
        Loading your owned products...
      </div>
    );
  }

  return <Products ownedProductIds={ownedProductIds} />;
}
