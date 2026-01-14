import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const messageSchema = z.object({
  sessionId: z.string(),
  content: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, content } = messageSchema.parse(body);

    // Get chat session and verify access
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        specialist: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }

    // Check if user is the owner or the assigned specialist
    const isUser = chatSession.userId === session.user.id;
    const isSpecialist = chatSession.specialistId && 
                        chatSession.specialist?.userId === session.user.id;

    if (!isUser && !isSpecialist) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Determine sender role
    const senderRole = isSpecialist ? "specialist" : "user";

    const message = await prisma.message.create({
      data: {
        sessionId,
        senderId: session.user.id,
        senderRole,
        content,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Message creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Get chat session and verify access
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        specialist: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }

    // Check if user is the owner or the assigned specialist
    const isUser = chatSession.userId === session.user.id;
    const isSpecialist = chatSession.specialistId && 
                        chatSession.specialist?.userId === session.user.id;

    if (!isUser && !isSpecialist) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: {
        createdAt: "asc",
      },
    });

    // For specialists, we don't need to modify messages since anonymity
    // is handled at the UI level (showing anonymousUserId instead of user info)
    return NextResponse.json({
      messages,
      anonymousUserId: chatSession.anonymousUserId || null,
    });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}









