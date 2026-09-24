import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAuthenticatedOrgId } from "@/lib/org";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getAuthenticatedOrgId(user);

  try {
    const body = await req.json();
    const { urlOrId, title, description, contextType = "general", contextId = null } = body;

    if (!urlOrId || typeof urlOrId !== "string") {
      return NextResponse.json({ error: "Miro board URL or Board ID is required" }, { status: 400 });
    }

    // Extract board ID from URL if full URL is passed e.g. https://miro.com/app/board/uXjVO12345=/
    let miroBoardId = urlOrId.trim();
    const boardUrlMatch = urlOrId.match(/board\/([a-zA-Z0-9_=-]+)/);
    if (boardUrlMatch && boardUrlMatch[1]) {
      miroBoardId = boardUrlMatch[1];
    }

    const boardTitle = title || `Linked Board (${miroBoardId.substring(0, 8)})`;

    const linkedBoard = await db.miroBoard.create({
      data: {
        orgId,
        miroBoardId,
        title: boardTitle,
        description: description || null,
        contextType,
        contextId: contextId ? String(contextId) : null,
        createdBy: user.name || user.email,
        isActive: true,
      },
    });

    return NextResponse.json({ board: linkedBoard }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to link Miro board" }, { status: 500 });
  }
}
