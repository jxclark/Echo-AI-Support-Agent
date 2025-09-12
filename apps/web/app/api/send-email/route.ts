import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";

const emailSchema = z.object({
  conversationId: z.string(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, subject, message } = emailSchema.parse(body);

    // Initialize Convex client with authentication
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const authResult = await auth();
    const token = await authResult.getToken({ template: "convex" });

    if (!token) {
      return NextResponse.json(
        { error: "Failed to get auth token" },
        { status: 401 }
      );
    }

    convex.setAuth(token);

    // Fetch the contact session to get the verified email address
    const contactSession = await convex.query(
      api.private.contactSessions.getOneByConversationId,
      {
        conversationId: conversationId as Id<"conversations">,
      }
    );

    if (!contactSession) {
      return NextResponse.json(
        { error: "Contact session not found" },
        { status: 404 }
      );
    }

    const recipientEmail = contactSession.email;
    const fromEmail = process.env.RESEND_FROM_EMAIL!;

    console.log("Sending email:", {
      from: fromEmail,
      to: recipientEmail,
      subject,
    });

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Message from Support</h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
              ${message.replace(/\n/g, "<br>")}
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">
              <p>This email was sent from your support dashboard.</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
