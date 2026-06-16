import { SignUp } from "@clerk/nextjs";

export default function RegistracijaPage() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-20">
      <SignUp
        routing="path"
        path="/registracija"
        signInUrl="/prijava"
        forceRedirectUrl="/ustvari"
      />
    </main>
  );
}
