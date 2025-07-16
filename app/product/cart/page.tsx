"use client";

import { useCart } from "../../components/CartContext";

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      <ul className="divide-y">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between py-3">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500">
                ${item.price.toFixed(2)} × {item.quantity}
              </p>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="text-red-500 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex justify-between items-center">
        <p className="font-semibold">
          Total: $
          {items.reduce((total, i) => total + i.price * i.quantity, 0).toFixed(2)}
        </p>
        <button
          onClick={clearCart}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}
