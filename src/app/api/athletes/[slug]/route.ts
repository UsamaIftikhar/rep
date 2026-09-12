import { NextResponse } from "next/server";
import { getPublicProfileBySlug } from "@/lib/profile";
import { getAuthenticatedUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const currentUser = await getAuthenticatedUser();
  const profile = await getPublicProfileBySlug(slug);

  if (!profile) {
    return NextResponse.json({ error: "Athlete profile not found or private" }, { status: 404 });
  }

  // Ownership check: Profile owner and admins can view even if private
  const isOwner = currentUser?.id === profile.userId;
  const isUserAdmin = isAdmin(currentUser);

  if (!profile.profileVisibility && !isOwner && !isUserAdmin) {
    return NextResponse.json({ error: "This athlete profile is set to private" }, { status: 403 });
  }

  return NextResponse.json({ profile });
}
