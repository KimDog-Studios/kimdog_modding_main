"use client";

import { useState } from "react";
import LoginForm from "../../components/Admin/LoginForm";
import SponsorsManager from "../../components/Admin/SponsorsManager";
import ProductsManager from "../../components/Admin/ProductsManager";
import UserManager from "../../components/Admin/UserManager";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return <LoginForm onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => setLoggedIn(false)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      <SponsorsManager />

      <div className="my-10 border-t" />

      <ProductsManager />

      <UserManager />
    </div>
  );
}
