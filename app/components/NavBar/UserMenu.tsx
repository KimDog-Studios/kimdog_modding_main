import React, { useRef, KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "firebase/auth";

interface UserMenuProps {
  user: User;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  onLogout: () => void;
}

export default function UserMenu({
  user,
  dropdownOpen,
  setDropdownOpen,
  onLogout,
}: UserMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") setDropdownOpen(false);
    if (e.key === "Enter" || e.key === " ") toggleDropdown();
  };

  return (
    <div
      className="relative cursor-pointer flex items-center space-x-2"
      onClick={toggleDropdown}
      ref={dropdownRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-haspopup="true"
      aria-expanded={dropdownOpen}
    >
      <Image
        src={user.photoURL || "/default-avatar.png"}
        alt={user.displayName || "User"}
        width={32}
        height={32}
        className="rounded-full hover:scale-110 shadow-md transition-transform duration-200 ease-in-out"
      />
      <span className="text-purple-300 font-semibold flex items-center">
        {user.displayName || "User"}
      </span>

      <div
        className={`absolute right-0 mt-2 w-44 bg-purple-900 rounded-md shadow-xl ring-1 ring-purple-700 transform origin-top-right transition-all duration-300 ${
          dropdownOpen
            ? "opacity-100 scale-100 visible"
            : "opacity-0 scale-95 invisible pointer-events-none"
        }`}
        role="menu"
      >
        <Link href="/settings">
          <div
            className="cursor-pointer px-4 py-2 text-purple-200 hover:bg-purple-700 hover:text-white rounded-t-md transition-colors"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
          >
            Settings
          </div>
        </Link>

        <button
          onClick={onLogout}
          className="w-full text-left px-4 py-2 text-purple-200 hover:bg-red-600 hover:text-white rounded-b-md transition-colors"
          role="menuitem"
          type="button"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}