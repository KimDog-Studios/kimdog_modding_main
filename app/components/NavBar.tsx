"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface LinkItem {
  name: string;
  href: string;
  external?: boolean;
  target?: string;
}

function NavBar() {
  const [activeLink, setActiveLink] = useState<string>("Home");

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

  const handleClick = (name: string) => {
    setActiveLink(name);
  };

  return (
    <div>
      {/* Top bar with icons */}
      <div className="relative flex items-center pt-10 max-w-screen-xl mx-auto px-6">
        {/* Search icon far left */}
        <button
          aria-label="Search"
          className="text-gray-300 hover:text-white focus:outline-none transition-transform transform hover:scale-110"
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
            <div className="flex items-center justify-center text-gray-300 hover:text-white transition-transform transform focus:outline-none cursor-pointer">
              <Image
                src="/logo.png"
                alt="Logo"
                width={300}
                height={300}
                className="rounded-full"
              />
            </div>
          </Link>
        </div>

        {/* Spacer to push right icons to the far right */}
        <div className="flex-grow" />

        {/* Right icons */}
        <div className="flex space-x-6 items-center">
          {/* Person icon */}
          <button
            aria-label="User Account"
            className="text-gray-300 hover:text-white focus:outline-none transition-transform transform hover:scale-110"
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
                d="M5.121 17.804A9 9 0 0118.88 6.196M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z"
              />
            </svg>
          </button>

          {/* Car/Bag icon */}
          <button
            aria-label="Bag/Cart"
            className="text-gray-300 hover:text-white focus:outline-none transition-transform transform hover:scale-110"
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
                d="M16 11V7a4 4 0 00-8 0v4M5 11h14l-1.68 7.35a2 2 0 01-1.97 1.65H8.65a2 2 0 01-1.97-1.65L5 11z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Nav links centered below */}
      <div className="flex flex-row justify-center space-x-6 pt-15">
        {links.map(({ name, href, external, target }) =>
          external ? (
            <a
              key={name}
              href={href}
              target={target}
              rel="noopener noreferrer"
              className={`pt-3 cursor-pointer ${
                activeLink === name ? "underline" : "hover:underline"
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
              className={`pt-3 cursor-pointer ${
                activeLink === name ? "underline" : "hover:underline"
              }`}
            >
              {name}
            </Link>
          )
        )}
      </div>
    </div>
  );
}

export default NavBar;
