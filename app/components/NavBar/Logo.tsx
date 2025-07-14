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
          src="https://firebasestorage.googleapis.com/v0/b/kimdog-modding.firebasestorage.app/o/logo.png?alt=media&token=65f6afec-498d-401c-b96b-72800a5a4ed4"
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