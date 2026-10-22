"use server";

import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import User, { USER_ROLES } from "@/models/user";
import { revalidatePath } from "next/cache";

const updateRoleSchema = z.object({
  clerkId: z.string().min(1).max(128),
  role: z.enum(USER_ROLES),
});

export async function updateUserRole(input: unknown) {
  // Validate input before performing any database operation.
  const parsed = updateRoleSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  try {
    // Never accept the caller's claimed role as proof of authorization.
    const admin = await requireAdmin();

    if (admin.clerkId === parsed.data.clerkId && parsed.data.role !== "admin") {
      return {
        success: false,
        error: "Manage your own role through a separate process",
      };
    }

    await connectDB();

    const target = await User.findOneAndUpdate(
      {
        clerkId: parsed.data.clerkId,
        isActive: true,
      },
      { $set: { role: parsed.data.role } },
      { new: true, runValidators: true },
    ).select("clerkId role");

    if (!target) {
      return {
        success: false,
        error: "Active user not found",
      };
    }

    revalidatePath("/admin");

    return {
      success: true,
      user: {
        clerkId: target.clerkId,
        role: target.role,
      },
    };
  } catch (error) {
    // Redirects from requireAdmin() must be allowed to propagate.
    // Do not catch Next.js redirect signals as generic errors.
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("updateUserRole failed", error);

    return {
      success: false,
      error: "Unable to update role",
    };
  }
}
