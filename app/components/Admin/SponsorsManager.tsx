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

type Sponsor = {
  id: string;
  name: string;
  description: string;
  buttonText: string;
  image: string;
};

export default function SponsorsManager() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [error, setError] = useState("");

  const fetchSponsors = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "sponsors"));
      const data: Sponsor[] = [];
      querySnapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Sponsor);
      });
      setSponsors(data);
    } catch {
      setError("Failed to load sponsors.");
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sponsor?")) return;
    try {
      await deleteDoc(doc(db, "sponsors", id));
      setSponsors((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Failed to delete sponsor.");
    }
  };

  const handleAdd = () => {
    setEditingSponsor({
      id: "",
      name: "",
      description: "",
      buttonText: "",
      image: "",
    });
  };

  const handleSave = async (sponsor: Sponsor) => {
    try {
      if (sponsor.id) {
        const sponsorRef = doc(db, "sponsors", sponsor.id);
        await updateDoc(sponsorRef, sponsor);
        setSponsors((prev) =>
          prev.map((s) => (s.id === sponsor.id ? sponsor : s))
        );
      } else {
        const docRef = await addDoc(collection(db, "sponsors"), sponsor);
        setSponsors((prev) => [...prev, { ...sponsor, id: docRef.id }]);
      }
      setEditingSponsor(null);
      setError("");
    } catch {
      setError("Failed to save sponsor.");
    }
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    if (!file) return "";
    try {
      const fileRef = ref(storage, `db/sponsors/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch {
      setError("Image upload failed.");
      return "";
    }
  };

  // Sponsor Edit Modal component, dark mode styling:
  const SponsorEditModal = ({
    sponsor,
    onClose,
    onSave,
  }: {
    sponsor: Sponsor;
    onClose: () => void;
    onSave: (s: Sponsor) => void;
  }) => {
    const [form, setForm] = useState(sponsor);
    const [uploading, setUploading] = useState(false);
    const [localError, setLocalError] = useState("");

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
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
        !form.description.trim() ||
        !form.buttonText.trim() ||
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
          className="bg-gray-900 text-white rounded-lg p-6 max-w-md w-full space-y-4 shadow-lg overflow-auto max-h-[90vh]"
        >
          <h2 className="text-2xl font-bold mb-4">
            {form.id ? "Edit Sponsor" : "Add Sponsor"}
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
            name="buttonText"
            placeholder="Button Text"
            className="w-full bg-black border border-gray-600 text-white px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:border-white"
            value={form.buttonText}
            onChange={handleChange}
            required
          />
          <div>
            <label className="block mb-1">Image URL or Upload</label>
            {form.image && (
              <img
                src={form.image}
                alt="Sponsor"
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

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-300"
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
        <h2 className="text-3xl font-semibold text-white">Manage Sponsors</h2>
        <button
          onClick={handleAdd}
          className="bg-white text-black px-4 py-2 rounded hover:bg-gray-300"
        >
          Add Sponsor
        </button>
      </div>
      {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sponsors.map((s) => (
          <div
            key={s.id}
            className="border border-gray-700 rounded p-4 bg-gray-800 flex flex-col"
          >
            <img
              src={s.image}
              alt={s.name}
              className="w-full h-48 object-contain mb-3 rounded"
            />
            <h3 className="text-xl font-bold text-white">{s.name}</h3>
            <p className="mb-2 text-gray-300">{s.description}</p>
            <p className="mb-3 font-semibold text-gray-400">{s.buttonText}</p>
            <div className="mt-auto flex gap-2">
              <button
                onClick={() => setEditingSponsor(s)}
                className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400 flex-1"
              >
                Edit
              </button>
              <button
                onClick={() => handleRemove(s.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500 flex-1"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {editingSponsor && (
        <SponsorEditModal
          sponsor={editingSponsor}
          onClose={() => setEditingSponsor(null)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}