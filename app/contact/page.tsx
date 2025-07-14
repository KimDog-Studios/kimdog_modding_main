'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase'; // adjust this path as needed
import NavBar from '../components/NavBar/NavBar';
import LoadingScreen from '../components/LoadingScreen';

export default function ContactPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <div>
      <NavBar user={user} onLogout={handleLogout} />
      <main className="max-w-4xl mx-auto px-6 py-20 text-white">
        <h1 className="text-4xl font-bold text-center mb-6">Contact Us</h1>
        <p className="text-center text-purple-300 mb-12">
          We'd love to hear from you. Fill out the form below or reach out directly via email.
        </p>

        <form className="grid grid-cols-1 gap-6 bg-purple-900/30 p-8 rounded-2xl shadow-lg backdrop-blur-md border border-purple-700/30">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-purple-200 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-4 py-2 rounded-md bg-purple-800/50 border border-purple-600 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 rounded-md bg-purple-800/50 border border-purple-600 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-purple-200 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="w-full px-4 py-2 rounded-md bg-purple-800/50 border border-purple-600 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="How can we help you?"
            ></textarea>
          </div>

          <button
            type="submit"
            className="mt-4 bg-purple-600 hover:bg-purple-500 transition-all text-white font-semibold py-2 px-6 rounded-lg shadow-md"
          >
            Send Message
          </button>
        </form>

        <p className="mt-8 text-center text-purple-400">
          Or email us directly at{' '}
          <a
            href="mailto:support@kimdog-modding.co.uk"
            className="text-purple-300 underline hover:text-white transition"
          >
            kim.dog.543@gmail.com
          </a>
        </p>
      </main>
    </div>
  );
}
