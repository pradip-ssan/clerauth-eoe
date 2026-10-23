import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// 1. Create a sub-component to handle the user check and private content rendering
async function DashboardContent() {
  const { userId } = await auth();

  // If the user isn't logged in, send them back to the sign-in screen
  if (!userId) {
    redirect("/sign-in");
  }

  // Safely grab user details from MongoDB using your helper function
  const dbUser = await getCurrentUser();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-200">
        Your Personal Dashboard
      </h1>
      <div className="p-4 bg-white border rounded-lg shadow-sm">
        <p className="text-gray-700">
          Welcome back,{" "}
          <span className="font-semibold">{dbUser?.firstName || "User"}</span>!
        </p>

        <p className="mt-4  text-gray-400 ">
          Your role: <strong>{dbUser?.role}</strong>
        </p>
      </div>
    </div>
  );
}

// 2. The main page component stays purely static, satisfying your system build settings
export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      {/* 3. Wrap inside Suspense to isolate runtime dynamic lookups from the static compiler */}
      <Suspense
        fallback={
          <p className="text-gray-500">Loading your profile environment...</p>
        }
      >
        <DashboardContent />
      </Suspense>
    </main>
  );
}
