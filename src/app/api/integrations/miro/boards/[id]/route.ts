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

  let board = await db.miroBoard.findFirst({
    where: {
      OR: [
        { id },
        { miroBoardId: id },
      ],
    },
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  // Ensure board is marked active if it was retrieved
  if (!board.isActive) {
    await db.miroBoard.update({
      where: { id: board.id },
      data: { isActive: true },
    });
    board.isActive = true;
  }

  // Clean the board ID in case a full URL was stored
  let cleanMiroId = board.miroBoardId.trim();
  const boardUrlMatch = cleanMiroId.match(/board\/([a-zA-Z0-9_=-]+)/) || cleanMiroId.match(/live-embed\/([a-zA-Z0-9_=-]+)/);
  if (boardUrlMatch && boardUrlMatch[1]) {
    cleanMiroId = boardUrlMatch[1];
  }

  cleanMiroId = cleanMiroId.split("?")[0].replace(/\/+$/, "");

  let embedToken = `embed_token_${Date.now()}`;
  let embedUrl = `https://miro.com/app/live-embed/${cleanMiroId}/?autoplay=true`;
  const directUrl = `https://miro.com/app/board/${cleanMiroId}/`;

  try {
    const accessToken = await getValidMiroAccessToken(orgId);
    // Request board metadata from Miro V2 API if connected
    const res = await fetch(`https://api.miro.com/v2/boards/${cleanMiroId}`, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.viewLink && data.viewLink.includes("live-embed")) {
        embedUrl = data.viewLink;
      }
    }
  } catch (err) {
    // Graceful fallback to standard live-embed URL
  }

  return NextResponse.json({
    board,
    embedToken,
    embedUrl,
    directUrl,
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
