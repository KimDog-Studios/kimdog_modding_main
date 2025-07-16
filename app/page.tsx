"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Products from "./components/Products/Products";
import LoadingScreen from "./components/LoadingScreen";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import HomePageSponsors from "./components/Sponsors/HomePage";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

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

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const productsRef = useRef<HTMLDivElement>(null);
  const sponsorsRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        router.push("/api/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(auth);
      router.push("/api/login");
    } catch (err) {
      console.error("Logout error", err);
      setLogoutLoading(false);
    }
  };

  // Scroll animations for Products section
  const productsScrollProgress =
    isClient && productsRef.current
      ? useScroll({
          target: productsRef,
          offset: ["start end", "end start"],
        }).scrollYProgress
      : null;

  const productsOpacity = productsScrollProgress
    ? useTransform(productsScrollProgress, [0, 0.5, 1], [0, 1, 0])
    : 1;
  const productsScale = productsScrollProgress
    ? useTransform(productsScrollProgress, [0, 0.5, 1], [0.8, 1, 0.8])
    : 1;
  const productsRotateX = productsScrollProgress
    ? useTransform(productsScrollProgress, [0, 0.5, 1], [30, 0, -30])
    : 0;
  const productsY = productsScrollProgress
    ? useTransform(productsScrollProgress, [0, 1], [100, -100])
    : 0;

  // Scroll animations for Sponsors section
  const sponsorsScrollProgress =
    isClient && sponsorsRef.current
      ? useScroll({
          target: sponsorsRef,
          offset: ["start end", "end start"],
        }).scrollYProgress
      : null;

  const sponsorsOpacity = sponsorsScrollProgress
    ? useTransform(sponsorsScrollProgress, [0, 0.5, 1], [0, 1, 0])
    : 1;
  const sponsorsX = sponsorsScrollProgress
    ? useTransform(sponsorsScrollProgress, [0, 0.5, 1], [100, 0, -100])
    : 0;
  const sponsorsSkew = sponsorsScrollProgress
    ? useTransform(sponsorsScrollProgress, [0, 0.5, 1], [15, 0, -15])
    : 0;

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!user) {
    return <LoadingScreen message="Redirecting to login..." />;
  }

  return (
    <div style={{ overflowX: "hidden" }}>
      {/* Products scroll animations */}
      <motion.div
        ref={productsRef}
        style={{
          opacity: productsOpacity,
          scale: productsScale,
          rotateX: productsRotateX,
          y: productsY,
          transformStyle: "preserve-3d",
          perspective: 800,
          marginBottom: 100,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Products />
      </motion.div>

      {/* Sponsors scroll animations */}
      <motion.div
        ref={sponsorsRef}
        style={{
          opacity: sponsorsOpacity,
          x: sponsorsX,
          skewX: sponsorsSkew,
          marginBottom: 100,
        }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <HomePageSponsors />
      </motion.div>

      {/* Logout confirmation modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60"
            variants={modalBackdropVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-modal="true"
            role="dialog"
            aria-labelledby="logout-confirm-title"
            aria-describedby="logout-confirm-desc"
          >
            <motion.div
              className="bg-gray-900 p-6 rounded-xl max-w-sm w-full text-white shadow-xl"
              variants={modalVariant}
            >
              <h3 id="logout-confirm-title" className="text-xl font-semibold mb-4">
                Confirm Logout
              </h3>
              <p id="logout-confirm-desc" className="mb-6 text-gray-300">
                Are you sure you want to log out?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
                  disabled={logoutLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {logoutLoading ? "Logging out..." : "Logout"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}