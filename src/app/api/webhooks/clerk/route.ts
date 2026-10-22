import { headers } from "next/headers";
import { Webhook } from "svix";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/user";

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!secret) {
    console.error("Missing Clerk webhook signing secret");

    return NextResponse.json(
      { error: "Webhook configuration error" },
      { status: 500 },
    );
  }

  const headerStore = await headers();

  const svixId = headerStore.get("svix-id");
  const svixTimestamp = headerStore.get("svix-timestamp");
  const svixSignature = headerStore.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing signature headers" },
      { status: 400 },
    );
  }

  let event: {
    type: string;
    data: { id?: string };
  };

  try {
    const payload = await request.text();

    const webhook = new Webhook(secret);

    event = webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as unknown as typeof event;
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  if (event.type === "user.deleted" && event.data.id) {
    try {
      await connectDB();

      await User.updateOne(
        { clerkId: event.data.id },
        { $set: { isActive: false } },
      );
    } catch (error) {
      console.error("Clerk deletion webhook failed", error);

      return NextResponse.json(
        { error: "Temporary processing failure" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
