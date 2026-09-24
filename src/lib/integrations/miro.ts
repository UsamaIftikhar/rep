import { db } from "../db";
import { encryptToken, decryptToken } from "../crypto";

const MIRO_CLIENT_ID = process.env.MIRO_CLIENT_ID || "mock_miro_client_id";
const MIRO_CLIENT_SECRET = process.env.MIRO_CLIENT_SECRET || "mock_miro_client_secret";
const MIRO_REDIRECT_URI = process.env.MIRO_REDIRECT_URI || "http://localhost:3000/api/integrations/miro/callback";

export function getMiroAuthUrl(orgId: string): string {
  const state = Buffer.from(JSON.stringify({ orgId })).toString("base64url");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: MIRO_CLIENT_ID,
    redirect_uri: MIRO_REDIRECT_URI,
    state,
  });
  return `https://miro.com/oauth/authorize?${params.toString()}`;
}

export async function handleMiroOAuthCallback(code: string, stateStr: string) {
  let orgId = "";
  try {
    const decoded = JSON.parse(Buffer.from(stateStr, "base64url").toString("utf8"));
    orgId = decoded.orgId;
  } catch {
    throw new Error("Invalid state parameter in Miro callback");
  }

  // Token exchange request
  const tokenRes = await fetch("https://api.miro.com/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: MIRO_CLIENT_ID,
      client_secret: MIRO_CLIENT_SECRET,
      code,
      redirect_uri: MIRO_REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error("Miro OAuth token exchange error:", errText);
    // Mock token support for testing environment if real API fails with mock credentials
    if (MIRO_CLIENT_ID === "mock_miro_client_id") {
      const mockAccessToken = `miro_access_${Date.now()}`;
      const mockRefreshToken = `miro_refresh_${Date.now()}`;
      const tokenExpiresAt = new Date(Date.now() + 3600 * 1000);

      return db.miroIntegration.upsert({
        where: { orgId },
        update: {
          accessToken: encryptToken(mockAccessToken),
          refreshToken: encryptToken(mockRefreshToken),
          tokenExpiresAt,
          miroUserId: "miro_user_mock",
          miroTeamId: "miro_team_mock",
          isActive: true,
          connectedAt: new Date(),
        },
        create: {
          orgId,
          accessToken: encryptToken(mockAccessToken),
          refreshToken: encryptToken(mockRefreshToken),
          tokenExpiresAt,
          miroUserId: "miro_user_mock",
          miroTeamId: "miro_team_mock",
          isActive: true,
        },
      });
    }
    throw new Error(`Miro OAuth token exchange failed: ${tokenRes.statusText}`);
  }

  const data = await tokenRes.json();
  const accessToken = data.access_token;
  const refreshToken = data.refresh_token;
  const expiresIn = data.expires_in || 3600;
  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
  const miroUserId = data.user_id ? String(data.user_id) : null;
  const miroTeamId = data.team_id ? String(data.team_id) : null;

  return db.miroIntegration.upsert({
    where: { orgId },
    update: {
      accessToken: encryptToken(accessToken),
      refreshToken: encryptToken(refreshToken || ""),
      tokenExpiresAt,
      miroUserId,
      miroTeamId,
      isActive: true,
      connectedAt: new Date(),
    },
    create: {
      orgId,
      accessToken: encryptToken(accessToken),
      refreshToken: encryptToken(refreshToken || ""),
      tokenExpiresAt,
      miroUserId,
      miroTeamId,
      isActive: true,
    },
  });
}

/**
 * Retrieves valid decrypted access token for org, refreshing if expired.
 */
export async function getValidMiroAccessToken(orgId: string): Promise<string> {
  const integration = await db.miroIntegration.findUnique({
    where: { orgId },
  });

  if (!integration || !integration.isActive) {
    throw new Error("Miro integration is not connected for this organization");
  }

  // Check if token is expired or expiring within 5 minutes
  if (integration.tokenExpiresAt && integration.tokenExpiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
    if (!integration.refreshToken) {
      await db.miroIntegration.update({ where: { orgId }, data: { isActive: false } });
      throw new Error("Miro refresh token missing. Please reconnect Miro.");
    }
    return refreshMiroToken(orgId, decryptToken(integration.refreshToken));
  }

  return decryptToken(integration.accessToken);
}

async function refreshMiroToken(orgId: string, refreshTokenStr: string): Promise<string> {
  try {
    const res = await fetch("https://api.miro.com/v1/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: MIRO_CLIENT_ID,
        client_secret: MIRO_CLIENT_SECRET,
        refresh_token: refreshTokenStr,
      }),
    });

    if (!res.ok) {
      await db.miroIntegration.update({ where: { orgId }, data: { isActive: false } });
      throw new Error("Failed to refresh Miro token");
    }

    const data = await res.json();
    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token || refreshTokenStr;
    const expiresIn = data.expires_in || 3600;
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    await db.miroIntegration.update({
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
    await db.miroIntegration.update({ where: { orgId }, data: { isActive: false } });
    throw err;
  }
}
