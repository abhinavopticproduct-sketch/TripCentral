import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

export async function requireUser() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { userId: session.user.id };
}