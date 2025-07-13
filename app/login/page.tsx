"use client";
import { useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (err: any) {
      console.error(err.message);
      setError(err.message || "Google sign-in failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-900 px-4">
      <div className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-sky-600">Sign In with Google</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md transition"
        >
          Sign In with Google
        </button>
      </div>
    </div>
  );
}
