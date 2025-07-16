"use client";

import React, { useState } from "react";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SignInLink from "./SignInLink";
import UserMenu from "./UserMenu";
import Cart from "./CartButton";
import { User } from "firebase/auth";
import { usePathname } from "next/navigation";

interface NavBarProps {
  user?: User | null;         // made optional
  onLogout?: () => void;      // made optional
}

const NavBar: React.FC<NavBarProps> = ({ user = null, onLogout }) => {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getActiveLinkName = () => {
    if (pathname === "/") return "Home";
    if (pathname.startsWith("/product/catalog")) return "Catalog";
    if (pathname.startsWith("/contact")) return "Contact";
    return ""; // No active link for others
  };

  const activeLink = getActiveLinkName();

  const handleLinkClick = () => {
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700/90 backdrop-blur-md shadow-xl border-b border-purple-700/30">
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex flex-col">
        {/* Top row */}
        <div className="flex items-center justify-center relative">
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Logo onClick={handleLinkClick} />
          </div>
          <div className="ml-auto flex items-center space-x-5 text-white">
            <Cart />
            {user ? (
              <UserMenu
                user={user}
                onLogout={onLogout ?? (() => {})} // safe fallback no-op
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
              />
            ) : (
              <SignInLink />
            )}
          </div>
        </div>

        {/* Nav links */}
        <nav className="mt-8 flex justify-center space-x-8 text-white">
          <NavLinks activeLink={activeLink} onLinkClick={handleLinkClick} />
        </nav>
      </div>
    </header>
  );
};

export default NavBar;