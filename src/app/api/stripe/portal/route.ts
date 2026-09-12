import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createStripeBillingPortal } from "@/lib/stripe";

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const portal = await createStripeBillingPortal({ userId: user.id, origin });
    return NextResponse.json({ url: portal.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to open billing portal";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
