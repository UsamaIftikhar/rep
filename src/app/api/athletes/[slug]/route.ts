import { NextResponse } from "next/server";
import { getPublicProfileBySlug } from "@/lib/profile";
import { getAuthenticatedUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { isMember } from "@/lib/entitlements";

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

  // Requiring authentication: recruiters and viewers MUST be logged in
  if (!currentUser) {
    return NextResponse.json(
      {
        error: "Access Restricted: You must be logged in as a member or recruiter to view athlete profiles.",
        isLocked: true,
        requiresLogin: true,
      },
      { status: 401 }
    );
  }

  // Ownership & Admin checks
  const isOwner = currentUser.id === profile.userId;
  const isUserAdmin = isAdmin(currentUser);

  if (!isOwner && !isUserAdmin) {
    const userIsMember = await isMember(currentUser.id);
    if (!userIsMember) {
      return NextResponse.json(
        {
          error: "Membership Required: Only active members or verified recruiters can view athlete profiles.",
          isLocked: true,
          requiresMembership: true,
        },
        { status: 403 }
      );
    }
  }

  if (!profile.profileVisibility && !isOwner && !isUserAdmin) {
    return NextResponse.json({ error: "This athlete profile is set to private" }, { status: 403 });
  }

  return NextResponse.json({ profile });
}

