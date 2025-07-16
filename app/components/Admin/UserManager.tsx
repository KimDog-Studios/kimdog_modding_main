"use client";

import { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { User as FirebaseUser, updateEmail, updatePassword } from "firebase/auth";

type UserProfile = {
  id: string;
  email: string;
  name?: string;
  role?: string;
};

export default function UserManager() {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({});
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthUser(user);
    });
    fetchUsers();
    return unsubscribe;
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError("");
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const usersData: UserProfile[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<UserProfile, "id">;
        usersData.push({ id: doc.id, ...data });
      });
      setUsers(usersData);
    } catch (err) {
      setError("Failed to fetch users.");
    }
    setLoading(false);
  }

  function openEditModal(user: UserProfile) {
    setEditingUser(user);
    setEditFormData({ ...user });
    setPassword(""); // reset password input
  }

  function closeEditModal() {
    setEditingUser(null);
    setEditFormData({});
    setPassword("");
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function saveUser() {
    if (!editingUser) return;
    const userRef = doc(db, "users", editingUser.id);
    try {
      // Update Firestore profile
      await updateDoc(userRef, editFormData);

      // If editing logged-in user and email changed, update Firebase Auth email
      if (
        authUser &&
        authUser.uid === editingUser.id &&
        editFormData.email &&
        editFormData.email !== authUser.email
      ) {
        await updateEmail(authUser, editFormData.email);
      }

      // If password input is filled and editing current user, update password
      if (authUser && authUser.uid === editingUser.id && password) {
        await updatePassword(authUser, password);
      }

      await fetchUsers();
      closeEditModal();
      alert("User updated successfully.");
    } catch (err) {
      alert("Failed to update user. " + (err as Error).message);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    alert(
      "User deletion is not supported from client side. Please use Firebase Admin Console or Admin SDK backend."
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-900 text-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6">User Management</h2>

      <p className="mb-4">
        Logged in as:{" "}
        <span className="font-semibold">{authUser?.email || "No user"}</span>
      </p>

      {loading && <p>Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && users.length === 0 && <p>No users found.</p>}

      <table className="w-full table-auto border-collapse border border-gray-700 mb-6">
        <thead>
          <tr>
            <th className="border border-gray-700 px-4 py-2">Email</th>
            <th className="border border-gray-700 px-4 py-2">Name</th>
            <th className="border border-gray-700 px-4 py-2">Role</th>
            <th className="border border-gray-700 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-800">
              <td className="border border-gray-700 px-4 py-2">{user.email}</td>
              <td className="border border-gray-700 px-4 py-2">
                {user.name || "-"}
              </td>
              <td className="border border-gray-700 px-4 py-2">
                {user.role || "-"}
              </td>
              <td className="border border-gray-700 px-4 py-2 space-x-2">
                <button
                  onClick={() => openEditModal(user)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-xl w-96 max-w-full">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>

            <label className="block mb-2">
              Email:
              <input
                type="email"
                name="email"
                value={editFormData.email || ""}
                onChange={handleChange}
                className="w-full p-2 mt-1 rounded bg-gray-800 border border-gray-700"
                disabled={authUser?.uid !== editingUser.id} // Only allow email change for current user
              />
              {authUser?.uid !== editingUser.id && (
                <p className="text-sm text-gray-400 mt-1">
                  Can only change email for yourself.
                </p>
              )}
            </label>

            <label className="block mb-2">
              Name:
              <input
                type="text"
                name="name"
                value={editFormData.name || ""}
                onChange={handleChange}
                className="w-full p-2 mt-1 rounded bg-gray-800 border border-gray-700"
              />
            </label>

            <label className="block mb-2">
              Role:
              <select
                name="role"
                value={editFormData.role || ""}
                onChange={handleChange}
                className="w-full p-2 mt-1 rounded bg-gray-800 border border-gray-700"
              >
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </label>

            {authUser?.uid === editingUser.id && (
              <label className="block mb-4">
                New Password:
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 mt-1 rounded bg-gray-800 border border-gray-700"
                  placeholder="Leave empty to keep current password"
                />
              </label>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={closeEditModal}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveUser}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
