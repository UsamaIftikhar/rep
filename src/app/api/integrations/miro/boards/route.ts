import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAuthenticatedOrgId } from "@/lib/org";
import { db } from "@/lib/db";
import { getValidMiroAccessToken } from "@/lib/integrations/miro";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getAuthenticatedOrgId(user);
  const { searchParams } = new URL(req.url);
  const contextType = searchParams.get("context_type");
  const contextId = searchParams.get("context_id");

  const whereClause: any = {
    orgId,
    isActive: true,
  };

  if (contextType) {
    whereClause.contextType = contextType;
  }
  if (contextId) {
    whereClause.contextId = contextId;
  }

  const boards = await db.miroBoard.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ boards });
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getAuthenticatedOrgId(user);

  try {
    const body = await req.json();
    const { title, description, contextType = "general", contextId = null } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Board title is required" }, { status: 400 });
    }

    let miroBoardId = `board_mock_${Date.now()}`;

    // Attempt real Miro API board creation if token exists
    try {
      const accessToken = await getValidMiroAccessToken(orgId);
      const miroRes = await fetch("https://api.miro.com/v2/boards", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: title,
          description: description || undefined,
        }),
      });

      if (miroRes.ok) {
        const miroData = await miroRes.json();
        if (miroData.id) {
          miroBoardId = miroData.id;
        }
      }
    } catch (err) {
      console.warn("Miro API call fallback to generated board ID:", err);
    }

    const newBoard = await db.miroBoard.create({
      data: {
        orgId,
        miroBoardId,
        title,
        description: description || null,
        contextType,
        contextId: contextId ? String(contextId) : null,
        createdBy: user.name || user.email,
        isActive: true,
      },
    });

    return NextResponse.json({ board: newBoard }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create Miro board" }, { status: 500 });
  }
}
