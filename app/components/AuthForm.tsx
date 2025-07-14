"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "../lib/firebase"; // Adjust path

type AuthFormProps = {
  onLoginSuccess?: (user: User) => void;
};

const fadeVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const modalBackdropVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariant = {
  hidden: { opacity: 0, scale: 0.8, y: -20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: -20 },
};

export default function AuthForm({ onLoginSuccess }: AuthFormProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | "login" | "signup" | "reset">(null);

  // State for Google confirmation modal & user info
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [showGoogleConfirm, setShowGoogleConfirm] = useState(false);

  useEffect(() => {
    if (cooldown) {
      const timer = setTimeout(() => setCooldown(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  function sanitizeInput(input: string) {
    return input.trim();
  }

  async function executeAction() {
    setAuthLoading(true);
    setConfirmAction(null);
    const safeEmail = sanitizeInput(email);
    const safePassword = sanitizeInput(password);

    try {
      let userCredential;
      if (confirmAction === "login") {
        userCredential = await signInWithEmailAndPassword(auth, safeEmail, safePassword);
        toast.success("Logged in successfully!");
        onLoginSuccess?.(userCredential.user);
      } else if (confirmAction === "signup") {
        if (safePassword.length < 6) {
          toast.error("Password must be at least 6 characters.");
          setAuthLoading(false);
          return;
        }
        userCredential = await createUserWithEmailAndPassword(auth, safeEmail, safePassword);
        toast.success("Account created and logged in!");
        onLoginSuccess?.(userCredential.user);
      } else if (confirmAction === "reset") {
        await sendPasswordResetEmail(auth, safeEmail);
        toast.success("Password reset email sent!");
        setAuthMode("login");
      }
      setEmail("");
      setPassword("");
    } catch (error: any) {
      toast.error(error.message || "Authentication failed.");
      setCooldown(true);
    }
    setAuthLoading(false);
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cooldown) {
      toast.error("Please wait a moment before trying again.");
      return;
    }
    setConfirmAction(authMode);
  }

  // Google Sign-in handler with user info preview
  async function handleGoogleSignIn() {
    if (cooldown) {
      toast.error("Please wait a moment before trying again.");
      return;
    }
    setAuthLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const userCredential = await signInWithPopup(auth, provider);
      // Show modal with user info for confirmation
      setGoogleUser(userCredential.user);
      setShowGoogleConfirm(true);
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed.");
      setCooldown(true);
      setAuthLoading(false);
    }
  }

  // Confirm Google login after user reviews details
  async function confirmGoogleLogin() {
    setAuthLoading(true);
    setShowGoogleConfirm(false);
    try {
      if (googleUser) {
        toast.success(`Welcome ${googleUser.displayName || googleUser.email}!`);
        onLoginSuccess?.(googleUser);
      }
    } catch {
      toast.error("Error during Google login confirmation.");
    } finally {
      setAuthLoading(false);
      setGoogleUser(null);
    }
  }

  // Cancel Google login and sign out immediately
  async function cancelGoogleLogin() {
    setShowGoogleConfirm(false);
    setAuthLoading(true);
    try {
      await signOut(auth);
      toast("Google sign-in cancelled.", { icon: "❌" });
    } catch {
      toast.error("Failed to sign out.");
    } finally {
      setAuthLoading(false);
      setGoogleUser(null);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-6">
      {/* Auth Form */}
      <motion.form
        onSubmit={handleFormSubmit}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeVariant}
        className="bg-gray-900 p-8 rounded-xl text-white max-w-md w-full flex flex-col gap-5 shadow-lg"
        aria-live="polite"
        aria-busy={authLoading}
      >
        <h2 className="text-3xl font-extrabold mb-2 text-center tracking-wide select-none">
          {authMode === "login"
            ? "Login"
            : authMode === "signup"
            ? "Sign Up"
            : "Reset Password"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          aria-label="Email"
          disabled={authLoading}
        />

        {(authMode === "login" || authMode === "signup") && (
          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={authMode === "login" ? "current-password" : "new-password"}
            aria-label="Password"
            disabled={authLoading}
          />
        )}

        <button
          type="submit"
          disabled={authLoading || cooldown}
          className="bg-purple-600 hover:bg-purple-700 transition-colors py-3 rounded font-semibold disabled:opacity-50"
          aria-live="polite"
        >
          {authLoading
            ? authMode === "login"
              ? "Logging in..."
              : authMode === "signup"
              ? "Signing up..."
              : "Sending reset email..."
            : authMode === "login"
            ? "Login"
            : authMode === "signup"
            ? "Sign Up"
            : "Send Reset Email"}
        </button>

        {(authMode === "login" || authMode === "signup") && (
          <>
            <button
              type="button"
              disabled={authLoading || cooldown}
              onClick={handleGoogleSignIn}
              className="mt-3 bg-red-600 hover:bg-red-700 transition-colors py-3 rounded font-semibold flex items-center justify-center gap-3 disabled:opacity-50"
              aria-label="Continue with Google"
            >
              {/* Google Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 48 48"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3C34.4 32.7 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 2.9l5.7-5.7C33.6 7.6 28.9 6 24 6 12.9 6 4 14.9 4 26s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.9l6.6 4.8C14.2 17 18.6 14 24 14c3.1 0 5.9 1.1 8 2.9l5.7-5.7C33.6 7.6 28.9 6 24 6c-7.2 0-13.3 4.3-17.7 10.9z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.1 0 9.5-1.7 12.7-4.5l-6-5.5c-2 1.3-4.5 2-7 2-5.7 0-10.4-3.3-12.2-8.2l-6.6 5.1C9.6 38.9 16.2 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3c-1 3.1-3.5 5.7-6.9 7.2l6 5.5C37.6 35.4 43.6 28.9 43.6 20.5z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="mt-3 text-center text-sm text-gray-400">
              {authMode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="underline text-purple-400 hover:text-purple-600"
                    onClick={() => setAuthMode("signup")}
                  >
                    Sign Up
                  </button>
                  <br />
                  <button
                    type="button"
                    className="underline text-purple-400 hover:text-purple-600 mt-2"
                    onClick={() => setAuthMode("reset")}
                  >
                    Forgot Password?
                  </button>
                </>
              ) : authMode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="underline text-purple-400 hover:text-purple-600"
                    onClick={() => setAuthMode("login")}
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Remembered your password?{" "}
                  <button
                    type="button"
                    className="underline text-purple-400 hover:text-purple-600"
                    onClick={() => setAuthMode("login")}
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </motion.form>

      {/* Confirmation Modal for Email Actions */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60"
            variants={modalBackdropVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-modal="true"
            role="dialog"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-desc"
          >
            <motion.div
              className="bg-gray-900 p-6 rounded-xl max-w-sm w-full text-white shadow-xl"
              variants={modalVariant}
            >
              <h3 id="confirm-modal-title" className="text-xl font-semibold mb-4">
                {confirmAction === "login" && "Confirm Login"}
                {confirmAction === "signup" && "Confirm Sign Up"}
                {confirmAction === "reset" && "Confirm Password Reset"}
              </h3>
              <p id="confirm-modal-desc" className="mb-6 text-gray-300">
                Are you sure you want to{" "}
                {confirmAction === "login"
                  ? "log in"
                  : confirmAction === "signup"
                  ? "create an account"
                  : "send a password reset email"}{" "}
                for <strong>{email || "your email"}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  disabled={authLoading}
                  className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {authLoading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Google Login */}
      <AnimatePresence>
        {showGoogleConfirm && googleUser && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60"
            variants={modalBackdropVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-modal="true"
            role="dialog"
            aria-labelledby="google-confirm-title"
            aria-describedby="google-confirm-desc"
          >
            <motion.div
              className="bg-gray-900 p-6 rounded-xl max-w-sm w-full text-white shadow-xl flex flex-col gap-4"
              variants={modalVariant}
            >
              <h3 id="google-confirm-title" className="text-xl font-semibold">
                Confirm Google Sign-in
              </h3>
              <div className="flex items-center gap-4">
                {googleUser.photoURL && (
                  <img
                    src={googleUser.photoURL}
                    alt={`${googleUser.displayName || "User"}'s avatar`}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{googleUser.displayName || "Google User"}</p>
                  <p className="text-gray-400 text-sm">{googleUser.email}</p>
                </div>
              </div>
              <p className="text-gray-300">
                Do you want to continue logging in with this Google account?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelGoogleLogin}
                  disabled={authLoading}
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmGoogleLogin}
                  disabled={authLoading}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
                >
                  {authLoading ? "Logging in..." : "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}