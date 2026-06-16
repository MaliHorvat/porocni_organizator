"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

interface CreatePageLinkProps {
  children: React.ReactNode;
  className?: string;
  plan?: "basic" | "premium";
}

function CreatePageLinkAuthed({
  children,
  className,
  plan,
}: CreatePageLinkProps) {
  const { isSignedIn, isLoaded } = useAuth();

  const ustvariHref = plan ? `/ustvari?plan=${plan}` : "/ustvari";
  const prijavaHref = plan
    ? `/prijava?redirect_url=${encodeURIComponent(ustvariHref)}`
    : "/prijava?redirect_url=%2Fustvari";

  if (!isLoaded) {
    return (
      <span className={className} aria-busy="true">
        {children}
      </span>
    );
  }

  const href = isSignedIn ? ustvariHref : prijavaHref;

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function CreatePageLink(props: CreatePageLinkProps) {
  const ustvariHref = props.plan
    ? `/ustvari?plan=${props.plan}`
    : "/ustvari";

  if (!clerkEnabled) {
    return (
      <Link href={ustvariHref} className={props.className}>
        {props.children}
      </Link>
    );
  }

  return <CreatePageLinkAuthed {...props} />;
}
