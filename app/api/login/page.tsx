"use client";
import React from "react";
import FancyLogin from "../../components/AuthForm";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Page() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser);
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Redirect when user logs in
  React.useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-purple-900 via-indigo-900 to-black p-4">
      <main className="flex-grow flex items-center justify-center">
        {!user ? (
          <>
            <div style={{ color: "white" }}>Showing login form:</div>
            <FancyLogin
              onLoginSuccess={() => console.log("Login successful!")}
            />
          </>
        ) : (
          <div className="text-white text-center">
            <h1 className="text-3xl font-bold mb-4">
              Welcome, {user.email || "User"}!
            </h1>
            <p>You are logged in.</p>
          </div>
        )}
      </main>
    </div>
  );
}