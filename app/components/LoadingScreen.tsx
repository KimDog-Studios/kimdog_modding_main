// src/components/LoadingScreen.jsx
"use client";
import React from "react";
import CircularProgress from "@mui/material/CircularProgress";

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen space-y-4 text-white">
      <CircularProgress color="inherit" />
      <span className="text-lg font-medium">{message}</span>
    </div>
  );
}
