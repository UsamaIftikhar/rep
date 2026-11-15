import nodemailer from "nodemailer";
import { Resend } from "resend";

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

export function getNotificationRecipients(): string[] {
  const envVal = process.env.NOTIFICATION_EMAIL || "jrmarvinconstant@gmail.com, usamaiftikhar59@gmail.com, rep1exposureinfo@gmail.com, rep1exposure@gmail.com";
  const list = envVal
    .split(/[,;]/)
    .map((e) => e.trim())
    .filter(Boolean);
  if (!list.includes("rep1exposure@gmail.com")) {
    list.push("rep1exposure@gmail.com");
  }
  return list;
}

function getResendClient() {
  if (process.env.RESEND_API_KEY) {
    return new Resend(process.env.RESEND_API_KEY);
  }
  return null;
}

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
                Recipients: <span style="color: #A3A3A3;">${getNotificationRecipients().join(", ")}</span>
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
    const from = process.env.RESEND_FROM || process.env.SMTP_FROM || `"REP 1 Sports" <onboarding@resend.dev>`;
    const recipients = getNotificationRecipients();

    const resend = getResendClient();
    if (resend) {
      const { data: resData, error } = await resend.emails.send({
        from,
        to: recipients,
        subject,
        html: htmlContent,
      });

      if (error) {
        console.error("[RESEND EMAIL ERROR]", error);
      } else {
        console.log(`[RESEND EMAIL SENT SUCCESS] ID: ${resData?.id} to ${recipients.join(", ")}`);
        return;
      }
    }

    const transporter = createTransporter();

    if (!transporter) {
      console.log(`[EMAIL NOTIFICATION LOG] (SMTP & Resend credentials missing in .env)`);
      console.log(`To: ${recipients.join(", ")}`);
      console.log(`Subject: ${subject}`);
      console.log(`User Signed Up: ${data.name} (${data.email})`);
      return;
    }

    const info = await transporter.sendMail({
      from,
      to: recipients.join(", "),
      subject,
      html: htmlContent,
    });

    console.log(`[EMAIL SENT SUCCESS] Message ID: ${info.messageId} to ${recipients.join(", ")}`);
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
    const from = process.env.RESEND_FROM || process.env.SMTP_FROM || `"REP 1 Sports" <onboarding@resend.dev>`;

    const resend = getResendClient();
    if (resend) {
      const { data: resData, error } = await resend.emails.send({
        from,
        to: [data.email],
        subject,
        html: htmlContent,
      });

      if (error) {
        console.error("[RESEND PASSWORD RESET ERROR]", error);
      } else {
        console.log(`[RESEND PASSWORD RESET SENT SUCCESS] ID: ${resData?.id} to ${data.email}`);
        return;
      }
    }

    const transporter = createTransporter();

    if (!transporter) {
      console.log(`[PASSWORD RESET EMAIL LOG] (SMTP/Resend credentials missing in .env)`);
      console.log(`To: ${data.email}`);
      console.log(`Reset URL: ${data.resetUrl}`);
      return;
    }

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

export interface ContactEmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function generateContactEmailHtml(data: ContactEmailParams): string {
  const nowFormatted = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "full",
    timeStyle: "short",
  });

  const escapedMessage = (data.message || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Message - REP 1 Exposure</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070707; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F5F5F5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #070707; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #111111; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
          <tr>
            <td style="background-color: #F21717; height: 6px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <span style="font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #FFFFFF; text-transform: uppercase;">
                REP<span style="color: #F21717;">1</span> EXPOSURE
              </span>
              <span style="display: block; font-size: 11px; font-weight: 700; color: #A3A3A3; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">
                New Website Contact Inquiry
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 900; text-transform: uppercase; color: #FFFFFF;">
                📩 New Inquiry Received
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #A3A3A3;">
                A visitor submitted a message through the <strong>rep1exposure.com/contact</strong> form on ${nowFormatted} (EST).
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #171717; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; color: #737373; font-weight: 700; text-transform: uppercase; width: 90px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">From:</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #FFFFFF; font-weight: 700; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; color: #737373; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Email:</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #00D1B2; font-weight: 600; border-bottom: 1px solid rgba(255, 255, 255, 0.05);"><a href="mailto:${data.email}" style="color: #00D1B2; text-decoration: none;">${data.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; color: #737373; font-weight: 700; text-transform: uppercase;">Subject:</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #FFFFFF; font-weight: 700;">${data.subject}</td>
                </tr>
              </table>

              <div style="background-color: #141414; border-left: 3px solid #F21717; padding: 20px; border-radius: 8px; margin-bottom: 28px;">
                <span style="display: block; font-size: 11px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Message:</span>
                <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #E5E5E5; white-space: pre-wrap;">${escapedMessage}</p>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" style="display: inline-block; padding: 14px 28px; background-color: #F21717; color: #FFFFFF; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 20px rgba(242, 23, 23, 0.4);">
                      Reply Directly to ${data.name} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #0D0D0D; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #737373; line-height: 1.5;">
                REP 1 Exposure &bull; Global Collegiate Recruiting Pathways<br>
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

export function generateContactConfirmationEmailHtml(data: ContactEmailParams): string {
  const escapedMessage = (data.message || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We Received Your Message - REP 1 Exposure</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070707; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F5F5F5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #070707; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #111111; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
          <tr>
            <td style="background-color: #F21717; height: 6px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <span style="font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #FFFFFF; text-transform: uppercase;">
                REP<span style="color: #F21717;">1</span> EXPOSURE
              </span>
              <span style="display: block; font-size: 11px; font-weight: 700; color: #A3A3A3; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">
                Message Confirmation
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 900; text-transform: uppercase; color: #FFFFFF;">
                Thank You for Reaching Out!
              </h1>
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #A3A3A3;">
                Hi ${data.name},
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #A3A3A3;">
                We have received your message regarding <strong>${data.subject}</strong>. Our team is reviewing your inquiry and will get back to you as quickly as possible.
              </p>

              <div style="background-color: #171717; border-left: 3px solid #00D1B2; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <span style="display: block; font-size: 11px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Your Message Copy:</span>
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #D4D4D4; white-space: pre-wrap;">${escapedMessage}</p>
              </div>

              <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #737373;">
                In the meantime, feel free to explore our verified athlete showcase database and coaching programs at <a href="https://rep1exposure.com" style="color: #F21717; text-decoration: none; font-weight: 600;">rep1exposure.com</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #0D0D0D; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #737373; line-height: 1.5;">
                REP 1 Exposure &bull; Global Collegiate Recruiting Pathways<br>
                Direct Support: <a href="mailto:rep1exposure@gmail.com" style="color: #A3A3A3; text-decoration: underline;">rep1exposure@gmail.com</a>
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

export async function sendContactFormEmail(data: ContactEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const htmlContent = generateContactEmailHtml(data);
    const subject = `📩 New Contact Inquiry: ${data.subject} (from ${data.name})`;
    const from = process.env.RESEND_FROM || process.env.SMTP_FROM || `"REP 1 Exposure" <noreply@rep1exposure.com>`;
    const recipients = getNotificationRecipients();

    let notificationSent = false;

    // 1. Send admin notification email via Resend
    const resend = getResendClient();
    if (resend) {
      try {
        const { data: resData, error } = await resend.emails.send({
          from,
          to: recipients,
          replyTo: data.email,
          subject,
          html: htmlContent,
        });

        if (!error && resData?.id) {
          console.log(`[RESEND CONTACT EMAIL SUCCESS] ID: ${resData.id} to ${recipients.join(", ")}`);
          notificationSent = true;
        } else if (error) {
          console.warn("[RESEND CONTACT EMAIL ERROR]", error);
        }
      } catch (resendErr) {
        console.warn("[RESEND CONTACT EXCEPTION]", resendErr);
      }
    }

    // Fallback to SMTP if Resend didn't send
    if (!notificationSent) {
      const transporter = createTransporter();
      if (transporter) {
        try {
          const info = await transporter.sendMail({
            from,
            to: recipients.join(", "),
            replyTo: `"${data.name}" <${data.email}>`,
            subject,
            html: htmlContent,
          });
          console.log(`[SMTP CONTACT EMAIL SUCCESS] Message ID: ${info.messageId} to ${recipients.join(", ")}`);
          notificationSent = true;
        } catch (smtpErr) {
          console.error("[SMTP CONTACT EMAIL ERROR]", smtpErr);
        }
      }
    }

    // 2. Send visitor confirmation email via Resend
    if (resend) {
      try {
        const confirmationHtml = generateContactConfirmationEmailHtml(data);
        await resend.emails.send({
          from,
          to: [data.email],
          subject: `We received your message: "${data.subject}" - REP 1 Exposure`,
          html: confirmationHtml,
        });
      } catch (confErr) {
        console.warn("[CONTACT CONFIRMATION EMAIL WARNING]", confErr);
      }
    }

    if (!notificationSent) {
      console.warn(`[CONTACT EMAIL NOTIFICATION FAILED] Logged: from ${data.name} <${data.email}>: ${data.subject}`);
      return { success: false, error: "Unable to dispatch notification email" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("[CONTACT FORM EMAIL FATAL ERROR]", error);
    return { success: false, error: error?.message || "Failed to send contact email" };
  }
}

