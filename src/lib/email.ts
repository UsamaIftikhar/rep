import nodemailer from "nodemailer";

interface NewUserEmailParams {
  name: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  sport?: string | null;
  position?: string | null;
  schoolClub?: string | null;
  graduationYear?: number | null;
  location?: string | null;
}

const NOTIFICATION_RECIPIENT = process.env.NOTIFICATION_EMAIL || "jrmarvinconstant@gmail.com";

function createTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    if (host.includes("gmail") || process.env.SMTP_SERVICE === "gmail") {
      return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      });
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Fallback log transport if SMTP credentials are missing
  return null;
}


export function generateNewUserEmailHtml(data: NewUserEmailParams): string {
  const appUrl = process.env.NEXTAUTH_URL || "https://rep1exposure.com";
  const nowFormatted = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "full",
    timeStyle: "short",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New User Registration Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070707; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F5F5F5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #070707; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #111111; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
          
          <!-- Red Accent Header Bar -->
          <tr>
            <td style="background-color: #F21717; height: 6px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header / Brand Section -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #FFFFFF; text-transform: uppercase;">
                      REP<span style="color: #F21717;">1</span> SPORTS
                    </span>
                    <span style="display: block; font-size: 11px; font-weight: 700; color: #A3A3A3; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">
                      Executive Administration Alert
                    </span>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; padding: 6px 12px; background-color: rgba(242, 23, 23, 0.15); border: 1px solid rgba(242, 23, 23, 0.4); border-radius: 20px; font-size: 10px; font-weight: 800; color: #F21717; text-transform: uppercase; letter-spacing: 1px;">
                      NEW SIGNUP
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #FFFFFF;">
                New Account Created 🚨
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #A3A3A3;">
                A new user has just registered on the REP 1 Sports platform. Below are the profile details submitted during onboarding:
              </p>

              <!-- Profile Details Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #181818; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #A3A3A3; font-weight: 600; width: 120px;">Full Name:</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #FFFFFF; font-weight: 800;">${data.name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #A3A3A3; font-weight: 600;">Email Address:</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #00D1B2; font-weight: 700;">
                          <a href="mailto:${data.email}" style="color: #00D1B2; text-decoration: none;">${data.email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #A3A3A3; font-weight: 600;">Account Role:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #F21717; font-weight: 800; text-transform: uppercase;">${data.role}</td>
                      </tr>
                      ${data.sport ? `
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #A3A3A3; font-weight: 600;">Sport & Position:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #FFFFFF; font-weight: 700;">${data.sport.toUpperCase()} ${data.position ? `• ${data.position}` : ''}</td>
                      </tr>` : ''}
                      ${data.schoolClub ? `
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #A3A3A3; font-weight: 600;">School / Club:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #FFFFFF; font-weight: 600;">${data.schoolClub}</td>
                      </tr>` : ''}
                      ${data.graduationYear ? `
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #A3A3A3; font-weight: 600;">Class Year:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #FFFFFF; font-weight: 600;">Class of ${data.graduationYear}</td>
                      </tr>` : ''}
                      ${data.location ? `
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #A3A3A3; font-weight: 600;">Location:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #FFFFFF; font-weight: 600;">${data.location}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #A3A3A3; font-weight: 600;">Signed Up:</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #A3A3A3;">${nowFormatted}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-top: 8px; padding-bottom: 8px;">
                    <a href="${appUrl}/admin" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #F21717; color: #FFFFFF; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 20px rgba(242, 23, 23, 0.4);">
                      Open Admin Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0D0D0D; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #737373; line-height: 1.5;">
                This is an automated notification from the <strong>REP 1 Sports Platform</strong>.<br>
                Recipient: <span style="color: #A3A3A3;">${NOTIFICATION_RECIPIENT}</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendNewUserRegistrationEmail(data: NewUserEmailParams) {
  try {
    const htmlContent = generateNewUserEmailHtml(data);
    const subject = `🚨 New Signup: ${data.name} (${data.role}) - REP 1 Sports`;

    const transporter = createTransporter();

    if (!transporter) {
      console.log(`[EMAIL NOTIFICATION LOG] (SMTP credentials missing in .env)`);
      console.log(`To: ${NOTIFICATION_RECIPIENT}`);
      console.log(`Subject: ${subject}`);
      console.log(`User Signed Up: ${data.name} (${data.email})`);
      return;
    }

    const from = process.env.SMTP_FROM || `"REP 1 Sports" <noreply@rep1exposure.com>`;

    const info = await transporter.sendMail({
      from,
      to: NOTIFICATION_RECIPIENT,
      subject,
      html: htmlContent,
    });

    console.log(`[EMAIL SENT SUCCESS] Message ID: ${info.messageId} to ${NOTIFICATION_RECIPIENT}`);
  } catch (error) {
    console.error("[EMAIL SENDING ERROR]", error);
  }
}

export function generatePasswordResetEmailHtml(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - REP 1 Sports</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070707; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F5F5F5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #070707; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #111111; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
          
          <!-- Red Accent Header Bar -->
          <tr>
            <td style="background-color: #F21717; height: 6px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header / Brand Section -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <span style="font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #FFFFFF; text-transform: uppercase;">
                REP<span style="color: #F21717;">1</span> SPORTS
              </span>
              <span style="display: block; font-size: 11px; font-weight: 700; color: #A3A3A3; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">
                Account Security Request
              </span>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #FFFFFF;">
                Password Reset Request 🔐
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #A3A3A3;">
                Hello ${name || "Athlete"},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #A3A3A3;">
                We received a request to reset your password for your REP 1 Sports account. Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.
              </p>

              <!-- Call to Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 32px; background-color: #F21717; color: #FFFFFF; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 20px rgba(242, 23, 23, 0.4);">
                      Reset Password Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 12px 0; font-size: 12px; color: #737373; line-height: 1.5;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
              <p style="margin: 0; font-size: 11px; color: #525252; word-break: break-all;">
                Link not working? Copy and paste this URL into your browser:<br>
                <a href="${resetUrl}" style="color: #00D1B2; text-decoration: underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0D0D0D; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #737373; line-height: 1.5;">
                This security message was sent by <strong>REP 1 Sports</strong>.<br>
                &copy; ${new Date().getFullYear()} REP 1 Sports. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendPasswordResetEmail(data: { email: string; name: string; resetUrl: string }) {
  try {
    const htmlContent = generatePasswordResetEmailHtml(data.name, data.resetUrl);
    const subject = `Reset Your Password - REP 1 Sports`;

    const transporter = createTransporter();

    if (!transporter) {
      console.log(`[PASSWORD RESET EMAIL LOG] (SMTP credentials missing or fallback active)`);
      console.log(`To: ${data.email}`);
      console.log(`Reset URL: ${data.resetUrl}`);
      return;
    }

    const from = process.env.SMTP_FROM || `"REP 1 Sports" <noreply@rep1exposure.com>`;

    const info = await transporter.sendMail({
      from,
      to: data.email,
      subject,
      html: htmlContent,
    });

    console.log(`[PASSWORD RESET EMAIL SENT SUCCESS] Message ID: ${info.messageId} to ${data.email}`);
  } catch (error) {
    console.error("[PASSWORD RESET EMAIL ERROR]", error);
  }
}

