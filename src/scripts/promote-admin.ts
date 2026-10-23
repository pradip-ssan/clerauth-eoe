import "dotenv/config";
import { clerkClient } from "@clerk/nextjs/server";

import { connectDB } from "../lib/db";
import User from "../models/user";

async function main() {
  const clerkId = process.env.INITIAL_ADMIN_CLERK_ID;

  if (!clerkId || clerkId === "user_replace_me") {
    throw new Error(
      "Set INITIAL_ADMIN_CLERK_ID to your own verified Clerk user ID",
    );
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkId);

  if (!clerkUser.primaryEmailAddressId) {
    throw new Error("Admin account must have a primary email");
  }

  const email = clerkUser.emailAddresses.find(
    (item) => item.id === clerkUser.primaryEmailAddressId,
  )?.emailAddress;

  if (!email) {
    throw new Error("Primary email not found");
  }

  await connectDB();

  const result = await User.findOneAndUpdate(
    { clerkId },
    {
      $set: {
        email: email.toLowerCase(),
        firstName: clerkUser.firstName ?? "",
        lastName: clerkUser.lastName ?? "",
        imageUrl: clerkUser.imageUrl ?? "",
        role: "admin",
        isActive: true,
      },
      $setOnInsert: { clerkId },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  ).select("clerkId email role");

  console.log("Administrator initialized:", result?.toObject());
}

main()
  .catch((error) => {
    console.error("Admin initialization failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  });
