import { db } from "../db";
import { encryptToken, decryptToken } from "../crypto";

function getZoomClientId() {
  return process.env.ZOOM_CLIENT_ID || "mock_zoom_client_id";
}

function getZoomClientSecret() {
  return process.env.ZOOM_CLIENT_SECRET || "mock_zoom_client_secret";
}

function getZoomRedirectUri() {
  return process.env.ZOOM_REDIRECT_URI || "https://rep1exposure.com/api/integrations/zoom/callback";
}

export function getZoomAuthUrl(orgId: string): string {
  const state = Buffer.from(JSON.stringify({ orgId })).toString("base64url");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: getZoomClientId(),
    redirect_uri: getZoomRedirectUri(),
    state,
    scope: "meeting:write:meeting meeting:read:meeting user:read:user meeting:update:status meeting:delete:meeting cloud_recording:read:list_recording_files recording:read:recording",
  });
  return `https://zoom.us/oauth/authorize?${params.toString()}`;
}

export async function handleZoomOAuthCallback(code: string, stateStr: string) {
  let orgId = "";
  try {
    const decoded = JSON.parse(Buffer.from(stateStr, "base64url").toString("utf8"));
    orgId = decoded.orgId;
  } catch {
    throw new Error("Invalid state parameter in Zoom callback");
  }

  const basicAuth = Buffer.from(`${getZoomClientId()}:${getZoomClientSecret()}`).toString("base64");

  const tokenRes = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getZoomRedirectUri(),
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error("Zoom OAuth token exchange error:", errText);
    if (getZoomClientId() === "mock_zoom_client_id") {
      const mockAccessToken = `zoom_access_${Date.now()}`;
      const mockRefreshToken = `zoom_refresh_${Date.now()}`;
      const tokenExpiresAt = new Date(Date.now() + 3600 * 1000);

      return db.zoomIntegration.upsert({
        where: { orgId },
        update: {
          accessToken: encryptToken(mockAccessToken),
          refreshToken: encryptToken(mockRefreshToken),
          tokenExpiresAt,
          zoomUserId: "zoom_user_mock",
          zoomAccountId: "zoom_account_mock",
          isActive: true,
          connectedAt: new Date(),
        },
        create: {
          orgId,
          accessToken: encryptToken(mockAccessToken),
          refreshToken: encryptToken(mockRefreshToken),
          tokenExpiresAt,
          zoomUserId: "zoom_user_mock",
          zoomAccountId: "zoom_account_mock",
          isActive: true,
        },
      });
    }
    throw new Error(`Zoom OAuth token exchange failed: ${tokenRes.statusText}`);
  }

  const data = await tokenRes.json();
  const accessToken = data.access_token;
  const refreshToken = data.refresh_token;
  const expiresIn = data.expires_in || 3600;
  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

  return db.zoomIntegration.upsert({
    where: { orgId },
    update: {
      accessToken: encryptToken(accessToken),
      refreshToken: encryptToken(refreshToken || ""),
      tokenExpiresAt,
      zoomUserId: data.user_id ? String(data.user_id) : "me",
      zoomAccountId: data.account_id ? String(data.account_id) : null,
      isActive: true,
      connectedAt: new Date(),
    },
    create: {
      orgId,
      accessToken: encryptToken(accessToken),
      refreshToken: encryptToken(refreshToken || ""),
      tokenExpiresAt,
      zoomUserId: data.user_id ? String(data.user_id) : "me",
      zoomAccountId: data.account_id ? String(data.account_id) : null,
      isActive: true,
    },
  });
}

/**
 * Retrieves valid decrypted Zoom access token, auto-refreshing before expiry.
 * Defaults to the connected company Zoom account across the entire platform.
 */
export async function getValidZoomAccessToken(orgId?: string): Promise<string> {
  let integration = null;

  if (orgId) {
    integration = await db.zoomIntegration.findUnique({
      where: { orgId },
    });
  }

  // Single company account fallback for the entire app:
  if (!integration) {
    integration = await db.zoomIntegration.findFirst({
      where: { isActive: true },
      orderBy: { connectedAt: "desc" },
    });
  }

  if (!integration) {
    integration = await db.zoomIntegration.findFirst({
      orderBy: { connectedAt: "desc" },
    });
  }

  if (!integration) {
    throw new Error("Zoom company account is not connected. Please connect Zoom in Settings.");
  }

  const targetOrgId = integration.orgId;

  if (integration.tokenExpiresAt && integration.tokenExpiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
    if (!integration.refreshToken) {
      await db.zoomIntegration.update({ where: { orgId: targetOrgId }, data: { isActive: false } });
      throw new Error("Zoom refresh token missing. Please reconnect Zoom in Settings.");
    }
    return refreshZoomToken(targetOrgId, decryptToken(integration.refreshToken));
  }

  return decryptToken(integration.accessToken);
}

async function refreshZoomToken(orgId: string, refreshTokenStr: string): Promise<string> {
  const basicAuth = Buffer.from(`${getZoomClientId()}:${getZoomClientSecret()}`).toString("base64");
  try {
    const res = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshTokenStr,
      }),
    });

    if (!res.ok) {
      await db.zoomIntegration.update({ where: { orgId }, data: { isActive: false } });
      throw new Error("Failed to refresh Zoom token");
    }

    const data = await res.json();
    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token || refreshTokenStr;
    const expiresIn = data.expires_in || 3600;
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    await db.zoomIntegration.update({
      where: { orgId },
      data: {
        accessToken: encryptToken(newAccessToken),
        refreshToken: encryptToken(newRefreshToken),
        tokenExpiresAt,
        isActive: true,
      },
    });

    return newAccessToken;
  } catch (err) {
    await db.zoomIntegration.update({ where: { orgId }, data: { isActive: false } });
    throw err;
  }
}

/**
 * Terminates a meeting on Zoom Cloud so it does not block subsequent sessions.
 */
export async function endZoomMeetingOnCloud(orgId?: string, meetingId?: string): Promise<boolean> {
  if (!meetingId) return false;
  try {
    const token = await getValidZoomAccessToken(orgId);
    const cleanId = meetingId.replace(/[^0-9]/g, "");
    const res = await fetch(`https://api.zoom.us/v2/meetings/${cleanId}/status`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "end" }),
    });
    return res.status === 204 || res.ok;
  } catch (e) {
    console.warn(`[ZOOM_END_MEETING] Failed to end meeting ${meetingId} on Zoom Cloud:`, e);
    return false;
  }
}

/**
 * Finds and ends all in-progress / live meetings for the host on Zoom Cloud.
 */
export async function endAllLiveZoomMeetings(orgId?: string): Promise<{ endedIds: string[]; count: number }> {
  const endedIds: string[] = [];
  try {
    const token = await getValidZoomAccessToken(orgId);
    const listRes = await fetch("https://api.zoom.us/v2/users/me/meetings?type=live", {
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (listRes.ok) {
      const data = await listRes.json();
      if (Array.isArray(data.meetings)) {
        for (const m of data.meetings) {
          if (m.id) {
            const cleanId = String(m.id).replace(/[^0-9]/g, "");
            const endRes = await fetch(`https://api.zoom.us/v2/meetings/${cleanId}/status`, {
              method: "PUT",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ action: "end" }),
            });
            if (endRes.status === 204 || endRes.ok) {
              endedIds.push(cleanId);
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn("[ZOOM_END_ALL_MEETINGS] Error querying live meetings:", e);
  }
  return { endedIds, count: endedIds.length };
}
