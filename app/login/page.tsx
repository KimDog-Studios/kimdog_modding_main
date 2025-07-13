"use client";
import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/product/thank-you");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/product/thank-you");
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        router.push("/product/thank-you");
      }
    } catch (err: any) {
      console.error(err.message);
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-900 px-4">
      <form
        onSubmit={handleAuth}
        className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => setIsLoginMode(true)}
            className={`px-4 py-2 font-semibold ${
              isLoginMode ? "text-sky-600 border-b-2 border-sky-600" : "text-gray-500"
            } transition`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLoginMode(false)}
            className={`ml-6 px-4 py-2 font-semibold ${
              !isLoginMode ? "text-sky-600 border-b-2 border-sky-600" : "text-gray-500"
            } transition`}
          >
            Sign Up
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-center text-sky-600">
          {isLoginMode ? "Sign In" : "Create Account"}
        </h2>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        <label className="block mb-2 font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-md"
          required
        />

        <label className="block mb-2 font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-md"
          required
        />

        {!isLoginMode && (
          <>
            <label className="block mb-2 font-medium">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 mb-4 border rounded-md"
              required
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 rounded-md transition"
        >
          {isLoginMode ? "Login" : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
