"use client";

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div
      className="min-h-screen bg-black text-white flex items-center justify-center flex-col relative overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://firebasestorage.googleapis.com/v0/b/kimdog-modding.firebasestorage.app/o/54c45233-4bb6-4bd8-969c-df80086790d1.png?alt=media&token=37e9d964-1426-46ed-b8e5-d7d5764153d7')",
      }}
    >
      <div className="z-10 text-center px-6 max-w-lg">
        <p className="text-xl md:text-2xl text-gray-300 backdrop-blur-sm bg-black/30 p-4 rounded-xl shadow-lg">
          This American truck took a wrong turn... into space.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition"
        >
          Beam me Home
        </Link>
      </div>
    </div>
  );
}
