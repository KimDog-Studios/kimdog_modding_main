import Link from "next/link";

interface NavLinksProps {
  activeLink: string;
  onLinkClick: (name: string) => void;
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

export default function NavLinks({ activeLink, onLinkClick }: NavLinksProps) {
  return (
    <div className="flex space-x-4">
      {links.map(({ name, href, external }) => {
        const baseClasses =
          "relative text-purple-300 hover:text-white font-semibold text-lg cursor-pointer px-3 py-1";

        const activeClasses =
          "after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-purple-400 after:rounded-full after:transition-all after:duration-300 after:shadow-[0_0_8px_#9f7aea] after:w-full";

        return (
          <Link
            key={name}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className={`${baseClasses} ${
              activeLink === name ? activeClasses : ""
            }`}
            onClick={() => onLinkClick(name)}
          >
            {name}
          </Link>
        );
      })}
    </div>
  );
}