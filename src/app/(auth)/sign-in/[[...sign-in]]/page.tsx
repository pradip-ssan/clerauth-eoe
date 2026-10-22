import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react"; // 1. Import Suspense

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      {/* 2. Wrap the SignIn component inside Suspense */}
      <Suspense fallback={<div>Loading login panel...</div>}>
        <SignIn />
      </Suspense>
    </main>
  );
}
