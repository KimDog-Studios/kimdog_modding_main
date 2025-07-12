import React from 'react'
import Image from 'next/image'

function NavBar() {
  return (
    <div>
      {/* Container for search icon + logo + right icons */}
      <div className="relative flex items-center pt-10 max-w-screen-xl mx-auto px-6">
        {/* Search icon far left */}
        <button
          aria-label="Search"
          className="text-gray-300 hover:text-white focus:outline-none"
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
          <a href="/" className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={300}
              height={300}
              className="rounded-full"
            />
          </a>
        </div>

        {/* Spacer to push right icons to the far right */}
        <div className="flex-grow" />

        {/* Right icons */}
        <div className="flex space-x-6 items-center">
          {/* Person icon */}
          <button
            aria-label="User Account"
            className="text-gray-300 hover:text-white focus:outline-none"
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
                d="M5.121 17.804A9 9 0 1118.88 6.196 9 9 0 015.12 17.804z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* Car/Bag icon */}
          <button
            aria-label="Bag/Cart"
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {/* Example bag icon */}
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
      <div className="flex flex-row justify-center space-x-6 pt-6">
        <a href="/" className="underline pt-10">
          Home
        </a>
        <a href="/" className="hover:underline pt-10">
          Catalog
        </a>
        <a href="/" className="hover:underline pt-10">
          Contact
        </a>
        <a href="https://downloads.kimdog-modding.co.uk/" className="hover:underline pt-10" target="_blank" rel="noopener noreferrer">
          Access Downloads
        </a>
      </div>
    </div>
  )
}

export default NavBar
