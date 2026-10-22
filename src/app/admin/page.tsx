import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth";

// 1. Create a specialized sub-component to safely process your authorization logic
async function AdminDashboardContent() {
  const { userId, has } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if they are missing the admin role configuration
  const isAdmin =
    has({ role: "org:admin" }) || userId === process.env.INITIAL_ADMIN_CLERK_ID;

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  // Fetch data safely knowing they are a verified admin
  const userDetails = await getCurrentUser();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-red-600">
        Secure Admin Dashboard
      </h1>
      <p>
        System Operating Context Active. welcome back,{" "}
        {userDetails?.firstName || "Admin"}.
      </p>
    </div>
  );
}

// 2. The main page framework stays static and safe for your compiler cache configuration
export default function AdminPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      {/* 3. Wrap inside Suspense to separate the runtime lookup from the compilation pass */}
      <Suspense
        fallback={
          <p className="text-gray-500">
            Verifying administrative security keys...
          </p>
        }
      >
        <AdminDashboardContent />
      </Suspense>
    </main>
  );
}
