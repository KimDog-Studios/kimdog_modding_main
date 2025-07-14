"use client";
import React from "react";
import { motion, Transition, easeInOut, useReducedMotion } from "framer-motion";

const dotVariants = {
  animate: {
    scale: [1, 1.5, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: easeInOut,
    } as Transition,
  },
};

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.35,
      repeat: Infinity,
      repeatType: "loop" as "loop", // <-- fix here
    },
  },
};

type LoadingScreenProps = {
  message?: string;
  dotColor?: string;
  dotSize?: number;
  overlay?: boolean;
  children?: React.ReactNode;
};

export default function LoadingScreen({
  message = "Loading...",
  dotColor = "white",
  dotSize = 20,
  overlay = false,
  children,
}: LoadingScreenProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-busy="true"
      initial={{ opacity: 0 }}
      animate={shouldReduceMotion ? {} : { opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col justify-center items-center min-h-screen space-y-6 text-white ${
        overlay ? "bg-black bg-opacity-70 fixed inset-0 z-50" : ""
      }`}
    >
      <motion.div
        className="flex space-x-4"
        variants={containerVariants}
        animate={shouldReduceMotion ? undefined : "animate"}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block rounded-full"
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: dotColor,
            }}
            variants={dotVariants}
          />
        ))}
      </motion.div>

      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 2.5, ease: easeInOut }}
        className="text-lg font-medium"
      >
        {message}
      </motion.span>

      {children && <div>{children}</div>}
    </motion.div>
  );
}
