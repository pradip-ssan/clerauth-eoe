import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Suspense fallback={<div>Loading registration panel...</div>}>
        <SignUp />
      </Suspense>
    </main>
  );
}
