"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "firebase/auth";

interface NavBarProps {
  user: User | null;
  onLogout: () => void;
}

const links = [
  { name: "Home", href: "/" },
  { name: "Catalog", href: "/catalog" },
  { name: "Contact", href: "/contact" },
  {
    name: "Access Downloads",
    href: "https://downloads.kimdog-modding.co.uk/",
    external: true,
  },
];

const NavBar: React.FC<NavBarProps> = ({ user, onLogout }) => {
  const [activeLink, setActiveLink] = useState("Home");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutsideDropdown = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
  }, []);

  // Close search when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutsideSearch = (e: MouseEvent) => {
      if (
        searchOpen &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node) &&
        searchToggleRef.current &&
        !searchToggleRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };

    const handleEscKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutsideSearch);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSearch);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [searchOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  const handleClick = useCallback((name: string) => {
    setActiveLink(name);
  }, []);

  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => !prev);
    setSearchQuery("");
  }, []);

  const handleSearchSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        alert(`Search submitted: ${searchQuery}`);
        setSearchOpen(false);
        setSearchQuery("");
      }
    },
    [searchQuery]
  );

  const handleDropdownToggle = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  const handleUserKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") setDropdownOpen(false);
    if (["Enter", " "].includes(e.key)) handleDropdownToggle();
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 shadow-lg">
      <div className="relative flex items-center pt-10 max-w-screen-xl mx-auto px-6">
        {/* Search Icon */}
        <button
          aria-label="Toggle search"
          type="button"
          className={`text-purple-300 hover:text-purple-100 transition-transform transform hover:scale-110 ${
            searchOpen ? "text-purple-100" : ""
          }`}
          onClick={toggleSearch}
          ref={searchToggleRef}
        >
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
        </button>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className={`absolute left-14 top-8 transition-all duration-300 ease-in-out overflow-hidden ${
            searchOpen
              ? "w-64 opacity-100 pointer-events-auto"
              : "w-0 opacity-0 pointer-events-none"
          }`}
          role="search"
          ref={searchRef}
        >
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-purple-700/60 backdrop-blur-sm rounded-full px-4 py-2 text-purple-100 placeholder-purple-300 font-semibold outline-none shadow-md focus:ring-2 focus:ring-purple-400 transition duration-300 ease-in-out caret-purple-300"
            autoComplete="off"
            aria-label="Search input"
          />
        </form>

        <div className="flex-grow" />

        {/* Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" onClick={() => handleClick("Home")} legacyBehavior>
            <Image
              src="/logo.png"
              alt="Logo"
              width={300}
              height={300}
              className="rounded-full shadow-lg cursor-pointer"
              priority
            />
          </Link>
        </div>

        <div className="flex-grow" />

        {/* User/Login */}
        <div className="flex space-x-6 items-center relative">
          {user ? (
            <div
              className="flex items-center space-x-2 cursor-pointer select-none"
              onClick={handleDropdownToggle}
              ref={dropdownRef}
              tabIndex={0}
              onKeyDown={handleUserKeyDown}
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
              <span className="text-purple-300 hover:text-purple-100 font-semibold transition-colors">
                {user.displayName || "User"}
              </span>

              {/* Dropdown */}
              <div
                className={`absolute right-0 mt-12 w-44 bg-purple-900 rounded-md shadow-xl ring-1 ring-purple-700 transform origin-top-right transition-all duration-300 ${
                  dropdownOpen
                    ? "opacity-100 scale-100 visible"
                    : "opacity-0 scale-95 invisible pointer-events-none"
                }`}
                role="menu"
              >
                <Link href="/settings" passHref legacyBehavior>
                  <a
                    className="block px-4 py-2 text-purple-200 hover:bg-purple-700 hover:text-white rounded-t-md transition-colors"
                    onClick={() => setDropdownOpen(false)}
                    role="menuitem"
                  >
                    Settings
                  </a>
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
          ) : (
            <Link href="/login" legacyBehavior>
              <span className="text-purple-300 hover:text-purple-100 font-semibold transition-transform transform hover:scale-110 cursor-pointer">
                Sign In
              </span>
            </Link>
          )}

          {/* Cart Button */}
          <button
            aria-label="Bag/Cart"
            type="button"
            className="text-purple-300 hover:text-purple-100 transform hover:scale-110 transition-transform"
          >
            <svg
              className="h-7 w-7 drop-shadow-lg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 11h14l-1.68 7.35a2 2 0 01-1.97 1.65H8.65a2 2 0 01-1.97-1.65L5 11z"
              />
            </svg>
          </button>
        </div>
      </div>
      {/* Nav Links */}
      <nav
        className="flex justify-center space-x-8 pt-6 pb-6 bg-gradient-to-r from-purple-800 via-purple-700 to-purple-600 shadow-inner"
        aria-label="Primary Navigation"
      >
        {links.map(({ name, href, external }) => {
          const linkClasses = `relative text-purple-300 hover:text-white font-semibold text-lg cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-purple-400 after:rounded-full after:transition-all after:duration-300 after:shadow-[0_0_8px_#9f7aea] ${
            activeLink === name ? "after:w-full" : "after:w-0 hover:after:w-full"
          }`;

          return (
            <Link key={name} href={href} passHref legacyBehavior>
              <a
                className={linkClasses}
                onClick={() => handleClick(name)}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
              >
                {name}
              </a>
            </Link>
          );
        })}
      </nav>
    </header>
  );
};

export default NavBar;
