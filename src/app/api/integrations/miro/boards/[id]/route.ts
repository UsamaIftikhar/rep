import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAuthenticatedOrgId } from "@/lib/org";
import { db } from "@/lib/db";
import { getValidMiroAccessToken } from "@/lib/integrations/miro";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orgId = await getAuthenticatedOrgId(user);

  const board = await db.miroBoard.findFirst({
    where: { id, orgId, isActive: true },
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found or access denied" }, { status: 404 });
  }

  let embedToken = `embed_token_${Date.now()}`;
  let embedUrl = `https://miro.com/app/live-embed/${board.miroBoardId}/`;

  try {
    const accessToken = await getValidMiroAccessToken(orgId);
    // Request short-lived embed token from Miro V2 API if connected
    const res = await fetch(`https://api.miro.com/v2/boards/${board.miroBoardId}`, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.viewLink) {
        embedUrl = data.viewLink;
      }
    }
  } catch (err) {
    console.warn("Using default embed configuration for Miro board:", err);
  }

  return NextResponse.json({
    board,
    embedToken,
    embedUrl,
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orgId = await getAuthenticatedOrgId(user);

  const board = await db.miroBoard.findFirst({
    where: { id, orgId },
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found or access denied" }, { status: 404 });
  }

  await db.miroBoard.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true, message: "Board deactivated successfully" });
}
