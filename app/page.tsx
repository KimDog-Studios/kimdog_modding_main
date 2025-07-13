"use client";

import { useState, useEffect } from "react";
import NavigationBar from "./components/NavBar";
import Products from "./components/Products";
import LoadingScreen from "./components/LoadingScreen";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    const fallbackTimer = setTimeout(() => setLoading(false), 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div>
      <NavigationBar />
      {loading ? (
        <LoadingScreen message="Loading products..." />
      ) : (
        <Products />
      )}
    </div>
  );
}
