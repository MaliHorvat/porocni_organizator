"use client";

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";

export default function AuthNav() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <>
        <Link
          href="/ustvari"
          className="text-sm bg-sage text-white px-5 py-2 rounded-full hover:bg-sage-dark transition-colors"
        >
          Ustvari stran
        </Link>
        <UserButton />
      </>
    );
  }

  return (
    <>
      <Link
        href="/prijava"
        className="text-sm text-warm-gray hover:text-charcoal transition-colors hidden sm:block"
      >
        Prijava
      </Link>
      <Link
        href="/ustvari"
        className="text-sm bg-sage text-white px-5 py-2 rounded-full hover:bg-sage-dark transition-colors"
      >
        Ustvari stran
      </Link>
    </>
  );
}
