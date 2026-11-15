import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactFormEmail } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().email("Please provide a valid email address"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject is too long"),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(5000, "Message is too long"),
  botField: z.string().optional(), // Honeypot field
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, subject, message, botField } = result.data;

    // Honeypot spam check - silently ignore bots
    if (botField) {
      return NextResponse.json({
        success: true,
        message: "Thank you! Your message has been sent successfully.",
      });
    }

    const emailResult = await sendContactFormEmail({
      name,
      email,
      subject,
      message,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || "Failed to deliver contact message. Please try again or email us directly at rep1exposure@gmail.com." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been sent successfully. We will get back to you shortly.",
    });
  } catch (error) {
    console.error("[CONTACT_API_ERROR]", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while sending your message. Please try again or email rep1exposure@gmail.com." },
      { status: 500 }
    );
  }
}
