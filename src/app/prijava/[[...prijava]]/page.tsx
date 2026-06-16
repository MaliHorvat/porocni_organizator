import { SignIn } from "@clerk/nextjs";

export default function PrijavaPage() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-20">
      <SignIn
        routing="path"
        path="/prijava"
        signUpUrl="/registracija"
        forceRedirectUrl="/ustvari"
      />
    </main>
  );
}
