"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavigationBar from "./components/NavBar/NavBar";
import Products from "./components/Products/Products";
import LoadingScreen from "./components/LoadingScreen";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import HomePageSponsors from "./components/Sponsors/HomePage";
import { motion, AnimatePresence } from "framer-motion";

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

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!user) {
    return <LoadingScreen message="Redirecting to login..." />;
  }

  return (
    <div>
      {/* NavBar fade down */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <NavigationBar
          user={user}
          onLogout={() => setShowLogoutConfirm(true)}
        />
      </motion.div>

      {/* Products scroll-in animation */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Products />
      </motion.div>

      {/* Sponsors scroll-in animation */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
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
