"use client";

import Link from "next/link";
import { useCart } from "../CartContext";

export function CartButton() {
  const { items } = useCart();
  const count = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link
      href="/product/cart"
      className="relative hover:text-purple-300 transition-transform transform hover:scale-110 cursor-pointer"
      aria-label="Shopping Cart"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full">
          {count}
        </span>
      )}
    </Link>
  );
}
export default CartButton;