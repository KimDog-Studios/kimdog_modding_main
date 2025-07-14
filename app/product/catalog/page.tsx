'use client';

import React, { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar/NavBar'; // adjust path if needed
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase'; // adjust path if needed
import LoadingScreen from '../../components/LoadingScreen';

export default function Page() {
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
      <div className="p-6 text-white">This is the Catalog Page</div>
    </div>
  );
}
