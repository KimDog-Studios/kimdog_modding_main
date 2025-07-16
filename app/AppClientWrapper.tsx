"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./lib/firebase";
import FancyLogin from "./components/AuthForm";
import NavBarComponent from "./components/NavBar/NavBar"; // <-- your NavBar import
import { useRouter } from "next/navigation";

export default function AppClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  function handleLogout() {
    signOut(auth).catch((err) => console.error("Logout error:", err));
  }

  if (loading) return <div className="text-white p-4">Loading...</div>;

  if (!user)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-900 via-indigo-900 to-black text-white">
        <FancyLogin
          onLoginSuccess={() => {
            console.log("Logged in!");
            router.push("/"); // redirect after login success
          }}
        />
      </main>
    );

  return (
    <>
      <NavBarComponent user={user} onLogout={handleLogout} />
      <main>{children}</main>
    </>
  );
}