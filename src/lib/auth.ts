import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { cache } from "react";
import { redirect } from "next/navigation";

import { connectDB } from "@/lib/db";
import User, { type IUser, type UserRole } from "@/models/user";

export type SafeUser = {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  role: UserRole;
  isActive: boolean;
};

function toSafeUser(user: IUser): SafeUser {
  return {
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    role: user.role,
    isActive: user.isActive,
  };
}

// Get the authenticated user's MongoDB profile.
// Existing roles are never overwritten by profile synchronization.
export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const authObject = await auth();
  const userId = authObject?.userId;

  if (!userId) return null;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  const primaryEmail = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId,
  )?.emailAddress;

  if (!primaryEmail) {
    throw new Error("Authenticated user has no primary email");
  }

  await connectDB();

  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    {
      $set: {
        email: primaryEmail.toLowerCase(),
        firstName: clerkUser.firstName ?? "",
        lastName: clerkUser.lastName ?? "",
        imageUrl: clerkUser.imageUrl ?? "",
      },
      $setOnInsert: {
        clerkId: userId,
        role: "user",
        isActive: true,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  ).lean<IUser>();

  if (!user) {
    throw new Error("Unable to load user profile");
  }

  return toSafeUser(user);
});

export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!user.isActive) {
    redirect("/access-denied");
  }

  return user;
}

export async function requireRole(
  allowedRoles: readonly UserRole[],
): Promise<SafeUser> {
  const user = await requireUser();

  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }

  return user;
}

export async function requireAdmin(): Promise<SafeUser> {
  return requireRole(["admin"]);
}
