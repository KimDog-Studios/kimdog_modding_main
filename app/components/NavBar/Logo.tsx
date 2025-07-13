import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  onClick: () => void;
}

export default function Logo({ onClick }: LogoProps) {
  return (
    <div className="flex-grow text-center">
      <Link href="/" onClick={onClick} aria-label="Go to homepage">
        <Image
          src="/logo.png"
          alt="Logo"
          width={250}      // bigger width
          height={250}     // bigger height
          className="cursor-pointer"
          priority
        />
      </Link>
    </div>
  );
}