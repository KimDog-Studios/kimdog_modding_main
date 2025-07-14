"use client";
import React from "react";
import FancyLogin from "../../components/AuthForm";
import NavigationBar from "../../components/NavBar/NavBar";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Page() {
  const [user, setUser] = React.useState<User | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Redirect to home page on login
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-purple-900 via-indigo-900 to-black p-4">
      <NavigationBar user={user} onLogout={() => {}} />

      <main className="flex-grow flex items-center justify-center">
        {!user ? (
          <FancyLogin
            onLoginSuccess={() => {
              console.log("Login successful!");
              // User state updates from onAuthStateChanged listener above
            }}
          />
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