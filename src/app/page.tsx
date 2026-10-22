import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";

// 1. We create an isolated component to handle the dynamic navigation logic smoothly
async function NavigationLinks() {
  const { userId } = await auth();

  return (
    <nav className="mt-6 flex flex-wrap gap-4">
      {userId ? (
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Dashboard
        </Link>
      ) : (
        <>
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Sign in
          </Link>
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            Create account
          </Link>
        </>
      )}

      <Link href="/admin" className="text-blue-600 hover:underline">
        Admin area
      </Link>
    </nav>
  );
}

// 2. The main page component stays clean, static, and completely compatible with NextConfig
export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold">EOE Authentication</h1>

      <p className="mt-3 text-gray-500">
        Clerk + Next.js 16 + MongoDB + Mongoose
      </p>

      {/* 3. Wrap the dynamic component inside a Suspense boundary to satisfy the build settings */}
      <Suspense
        fallback={<p className="mt-6 text-gray-400">Loading links...</p>}
      >
        <NavigationLinks />
      </Suspense>
    </main>
  );
}
