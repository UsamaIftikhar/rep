import { db } from "../db";
import { encryptToken, decryptToken } from "../crypto";

const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID || "mock_zoom_client_id";
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET || "mock_zoom_client_secret";
const ZOOM_REDIRECT_URI = process.env.ZOOM_REDIRECT_URI || "http://localhost:3000/api/integrations/zoom/callback";

export function getZoomAuthUrl(orgId: string): string {
  const state = Buffer.from(JSON.stringify({ orgId })).toString("base64url");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: ZOOM_CLIENT_ID,
    redirect_uri: ZOOM_REDIRECT_URI,
    state,
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

  const basicAuth = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64");

  const tokenRes = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: ZOOM_REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error("Zoom OAuth token exchange error:", errText);
    if (ZOOM_CLIENT_ID === "mock_zoom_client_id") {
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
 */
export async function getValidZoomAccessToken(orgId: string): Promise<string> {
  const integration = await db.zoomIntegration.findUnique({
    where: { orgId },
  });

  if (!integration || !integration.isActive) {
    throw new Error("Zoom integration is not connected for this organization");
  }

  if (integration.tokenExpiresAt && integration.tokenExpiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
    if (!integration.refreshToken) {
      await db.zoomIntegration.update({ where: { orgId }, data: { isActive: false } });
      throw new Error("Zoom refresh token missing. Please reconnect Zoom.");
    }
    return refreshZoomToken(orgId, decryptToken(integration.refreshToken));
  }

  return decryptToken(integration.accessToken);
}

async function refreshZoomToken(orgId: string, refreshTokenStr: string): Promise<string> {
  const basicAuth = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64");
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
