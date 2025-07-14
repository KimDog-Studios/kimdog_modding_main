import Link from "next/link";

export default function SignInLink() {
  return (
    <Link
      href="/api/login"
      className="text-purple-300 hover:text-white font-semibold px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      Sign In
    </Link>
  );
}
