"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { app } from "../lib/firebase";

interface LinkItem {
  name: string;
  href: string;
  external?: boolean;
  target?: string;
}

function NavBar() {
  const [activeLink, setActiveLink] = useState<string>("Home");
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleClick = (name: string) => {
    setActiveLink(name);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setDropdownOpen(false);
    } catch (error) {
      console.error("Sign-out error", error);
    }
  };

  const links: LinkItem[] = [
    { name: "Home", href: "/" },
    { name: "Catalog", href: "/" },
    { name: "Contact", href: "/" },
    {
      name: "Access Downloads",
      href: "https://downloads.kimdog-modding.co.uk/",
      external: true,
      target: "_blank",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 shadow-lg">
      {/* Top bar with icons */}
      <div className="relative flex items-center pt-10 max-w-screen-xl mx-auto px-6">
        {/* Search icon far left */}
        <button
          aria-label="Search"
          className="text-purple-300 hover:text-purple-100 focus:outline-none transition-transform transform hover:scale-110"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
        </button>

        {/* Spacer to push logo center */}
        <div className="flex-grow" />

        {/* Logo centered absolutely */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" onClick={() => handleClick("Home")}>
            <div
              className="flex items-center justify-center text-purple-300 hover:text-purple-100 transition-transform transform focus:outline-none cursor-pointer"
              aria-label="Home"
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={300}
                height={300}
                className="rounded-full shadow-lg"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Spacer to push right icons to the far right */}
        <div className="flex-grow" />

        {/* Right icons */}
        <div className="flex space-x-6 items-center relative">
          {/* User area */}
          {user ? (
            <div
              className="flex items-center space-x-2 cursor-pointer select-none"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              ref={dropdownRef}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Escape") setDropdownOpen(false);
              }}
            >
              <Image
                src={user.photoURL || "/default-avatar.png"}
                alt={user.displayName || "User"}
                width={32}
                height={32}
                className="rounded-full transition-transform duration-200 ease-in-out hover:scale-110 shadow-md"
              />
              <span className="text-purple-300 hover:text-purple-100 select-text transition-colors duration-200 ease-in-out font-semibold">
                {user.displayName || "User"}
              </span>

              {/* Dropdown menu */}
              <div
                className={`absolute right-0 mt-12 w-44 bg-purple-900 rounded-md shadow-xl ring-1 ring-purple-700 ring-opacity-80
                  transform origin-top-right transition-all duration-300
                  ${
                    dropdownOpen
                      ? "opacity-100 scale-100 visible"
                      : "opacity-0 scale-95 invisible pointer-events-none"
                  }`}
              >
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-purple-200 hover:bg-purple-700 hover:text-white rounded-t-md transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-purple-200 hover:bg-red-600 hover:text-white rounded-b-md transition-colors"
                  type="button"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-purple-300 hover:text-purple-100 focus:outline-none transition-transform transform hover:scale-110 font-semibold"
              aria-label="Sign In"
            >
              Sign In
            </Link>
          )}

          {/* Car/Bag icon */}
          <button
            aria-label="Bag/Cart"
            className="text-purple-300 hover:text-purple-100 focus:outline-none transition-transform transform hover:scale-110"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 drop-shadow-lg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 11h14l-1.68 7.35a2 2 0 01-1.97 1.65H8.65a2 2 0 01-1.97-1.65L5 11z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Nav links centered below */}
      <nav
        aria-label="Primary Navigation"
        className="flex flex-row justify-center space-x-8 pt-6 pb-6 bg-gradient-to-r from-purple-800 via-purple-700 to-purple-600 shadow-inner"
      >
        {links.map(({ name, href, external, target }) =>
          external ? (
            <a
              key={name}
              href={href}
              target={target}
              rel="noopener noreferrer"
              className={`relative cursor-pointer text-purple-300 hover:text-white
                font-semibold text-lg
                after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-purple-400 after:rounded-full
                after:transition-all after:duration-300 after:shadow-[0_0_8px_#9f7aea]
                ${
                  activeLink === name
                    ? "after:w-full"
                    : "after:w-0 hover:after:w-full"
                }`}
              onClick={() => handleClick(name)}
            >
              {name}
            </a>
          ) : (
            <Link
              key={name}
              href={href}
              onClick={() => handleClick(name)}
              className={`relative cursor-pointer text-purple-300 hover:text-white
                font-semibold text-lg
                after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-purple-400 after:rounded-full
                after:transition-all after:duration-300 after:shadow-[0_0_8px_#9f7aea]
                ${
                  activeLink === name
                    ? "after:w-full"
                    : "after:w-0 hover:after:w-full"
                }`}
            >
              {name}
            </Link>
          )
        )}
      </nav>
    </div>
  );
}

export default NavBar;
