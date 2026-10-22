import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account disabled" }, { status: 403 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET /api/users failed", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
