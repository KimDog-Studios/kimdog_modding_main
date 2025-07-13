"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavigationBar from "./components/NavBar"; // confirm NavBar import path
import Products from "./components/Products";
import LoadingScreen from "./components/LoadingScreen";
import { auth } from "./lib/firebase"; // confirm path
import { onAuthStateChanged, User, signOut } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        router.push("/login"); // redirect if not logged in
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!user) {
    return <LoadingScreen message="Redirecting to login..." />;
  }

  return (
    <div>
      <NavigationBar user={user} onLogout={handleLogout} />
      <Products />
    </div>
  );
}
