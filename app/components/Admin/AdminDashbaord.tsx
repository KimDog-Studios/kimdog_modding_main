"use client";

import SponsorsManager from "./SponsorsManager";
import ProductsManager from "./ProductsManager";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 text-black p-10">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <SponsorsManager />
      <ProductsManager />
    </div>
  );
}
