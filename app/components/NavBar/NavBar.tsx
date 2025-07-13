import React, { useState } from "react";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SignInLink from "./SignInLink";
import UserMenu from "./UserMenu";
import CartButton from "./CartButton"; // import here
import { User } from "firebase/auth";

interface NavBarProps {
  user: User | null;
  onLogout: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ user, onLogout }) => {
  const [activeLink, setActiveLink] = useState("Home");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLinkClick = (name: string) => {
    setActiveLink(name);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700/90 backdrop-blur-md shadow-xl border-b border-purple-700/30">
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex flex-col">

        {/* Top row: logo centered, right side with cart + user side-by-side */}
        <div className="flex items-center justify-center relative">

          {/* Logo centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Logo onClick={() => handleLinkClick("Home")} />
          </div>

          {/* Right side horizontal stack */}
          <div className="ml-auto flex items-center space-x-5 text-white">
            <CartButton /> {/* Use cart button component */}

            {user ? (
              <UserMenu
                user={user}
                onLogout={onLogout}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
              />
            ) : (
              <SignInLink />
            )}
          </div>
        </div>

        {/* Nav links below, centered */}
        <nav className="mt-8 flex justify-center space-x-8 text-white">
          <NavLinks activeLink={activeLink} onLinkClick={handleLinkClick} />
        </nav>
      </div>
    </header>
  );
};

export default NavBar;