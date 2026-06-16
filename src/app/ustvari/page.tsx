import { Suspense } from "react";
import CreateWeddingPage from "./CreateWeddingForm";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <p className="text-warm-gray">Nalagam...</p>
        </div>
      }
    >
      <CreateWeddingPage />
    </Suspense>
  );
}
