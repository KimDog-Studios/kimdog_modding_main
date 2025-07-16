"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db, storage } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

type Product = {
  id: string;
  name: string;
  author: string;
  description: string;
  downloadUrl: string;
  game: string;
  image: string;
  lastUpdated: string;
  price: number;
};

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const data: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      setProducts(data);
    } catch {
      setError("Failed to load products.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Failed to delete product.");
    }
  };

  const handleAdd = () => {
    setEditingProduct({
      id: "",
      name: "",
      author: "",
      description: "",
      downloadUrl: "",
      game: "",
      image: "",
      lastUpdated: new Date().toISOString().split("T")[0],
      price: 0,
    });
  };

  const handleSave = async (product: Product) => {
    try {
      if (product.id) {
        const productRef = doc(db, "products", product.id);
        await updateDoc(productRef, product);
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? product : p))
        );
      } else {
        const docRef = await addDoc(collection(db, "products"), product);
        setProducts((prev) => [...prev, { ...product, id: docRef.id }]);
      }
      setEditingProduct(null);
      setError("");
    } catch {
      setError("Failed to save product.");
    }
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    if (!file) return "";
    try {
      const fileRef = ref(storage, `db/products/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch {
      setError("Image upload failed.");
      return "";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Product Edit Modal with full fields and image upload, dark mode styling:
  const ProductEditModal = ({
    product,
    onClose,
    onSave,
  }: {
    product: Product;
    onClose: () => void;
    onSave: (p: Product) => void;
  }) => {
    const [form, setForm] = useState(product);
    const [uploading, setUploading] = useState(false);
    const [localError, setLocalError] = useState("");

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setForm((prev) => ({
        ...prev,
        [name]: name === "price" ? Number(value) : value,
      }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      setLocalError("");
      const url = await handleUploadImage(file);
      if (url) setForm((prev) => ({ ...prev, image: url }));
      else setLocalError("Image upload failed");
      setUploading(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (
        !form.name.trim() ||
        !form.author.trim() ||
        !form.description.trim() ||
        !form.downloadUrl.trim() ||
        !form.game.trim() ||
        !form.image.trim()
      ) {
        setLocalError("All fields are required.");
        return;
      }
      onSave(form);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 text-white rounded-lg p-6 max-w-lg w-full space-y-4 shadow-lg overflow-auto max-h-[90vh]"
        >
          <h2 className="text-2xl font-bold mb-4">
            {form.id ? "Edit Product" : "Add Product"}
          </h2>
          {localError && (
            <p className="text-red-500 mb-2 font-semibold">{localError}</p>
          )}
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full bg-black border border-gray-600 text-white px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:border-white"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="author"
            placeholder="Author"
            className="w-full bg-black border border-gray-600 text-white px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:border-white"
            value={form.author}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            rows={3}
            className="w-full bg-black border border-gray-600 text-white px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:border-white resize-none"
            value={form.description}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="downloadUrl"
            placeholder="Download URL"
            className="w-full bg-black border border-gray-600 text-white px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:border-white"
            value={form.downloadUrl}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="game"
            placeholder="Game"
            className="w-full bg-black border border-gray-600 text-white px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:border-white"
            value={form.game}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="lastUpdated"
            placeholder="Last Updated"
            className="w-full bg-black border border-gray-600 text-white px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:border-white"
            value={form.lastUpdated}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            min={0}
            className="w-full bg-black border border-gray-600 text-white px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:border-white"
            value={form.price}
            onChange={handleChange}
            required
          />

          <div>
            <label className="block mb-1">Image URL or Upload</label>
            {form.image && (
              <img
                src={form.image}
                alt="Product"
                className="w-full max-h-48 object-contain mb-2 rounded"
              />
            )}
            <input
              type="url"
              name="image"
              placeholder="Image URL"
              className="w-full bg-black border border-gray-600 text-white px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:border-white mb-2"
              value={form.image}
              onChange={handleChange}
              required={!uploading}
              disabled={uploading}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="text-white"
            />
            {uploading && <p>Uploading image...</p>}
          </div>

          <div className="flex justify-between gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-300 flex-1"
              disabled={uploading}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-white">Manage Products</h2>
        <button
          onClick={handleAdd}
          className="bg-white text-black px-4 py-2 rounded hover:bg-gray-300"
        >
          Add Product
        </button>
      </div>
      {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="border border-gray-700 rounded p-4 bg-gray-800 flex flex-col"
          >
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-48 object-contain mb-3 rounded"
            />
            <h3 className="text-xl font-bold text-white">{p.name}</h3>
            <p className="text-gray-300 mb-1">Author: {p.author}</p>
            <p className="mb-2 text-gray-300">{p.description}</p>
            <p className="mb-1 text-gray-400 font-semibold">Game: {p.game}</p>
            <p className="mb-1 text-gray-400 font-semibold">
              Last Updated: {p.lastUpdated}
            </p>
            <p className="mb-3 text-gray-400 font-semibold">Price: ${p.price}</p>

            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setEditingProduct(p)}
                className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400 flex-1"
              >
                Edit
              </button>
              <button
                onClick={() => handleRemove(p.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500 flex-1"
              >
                Remove
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(p.downloadUrl)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500 flex-1"
              >
                Copy Download URL
              </button>
              <button
                onClick={() => window.open(p.downloadUrl, "_blank")}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500 flex-1"
              >
                Open Download URL
              </button>
            </div>
          </div>
        ))}
      </div>
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}