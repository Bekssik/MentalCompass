import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "crypto";

const chatInitSchema = z.object({
  initialMessage: z.string().min(1),
});

// GET - Check if a chat session exists for this post and specialist
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a specialist with verified certification
    const specialist = await prisma.specialist.findUnique({
      where: { userId: session.user.id },
      include: {
        certifications: {
          where: {
            status: "VERIFIED",
          },
        },
      },
    });

    if (!specialist || specialist.certifications.length === 0) {
      return NextResponse.json(
        { error: "Only verified specialists can access chats" },
        { status: 403 }
      );
    }

    // Check if a chat session exists for this post and specialist
    const existingChat = await prisma.chatSession.findFirst({
      where: {
        experiencePostId: params.postId,
        specialistId: specialist.id,
        status: "ACTIVE",
      },
    });

    if (existingChat) {
      return NextResponse.json({
        sessionId: existingChat.id,
        exists: true,
      });
    }

    return NextResponse.json({
      sessionId: null,
      exists: false,
    });
  } catch (error) {
    console.error("Error checking chat session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Initiate a private chat from a specialist to an anonymous user
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a specialist with verified certification
    const specialist = await prisma.specialist.findUnique({
      where: { userId: session.user.id },
      include: {
        certifications: {
          where: {
            status: "VERIFIED",
          },
        },
      },
    });

    if (!specialist || specialist.certifications.length === 0) {
      return NextResponse.json(
        { error: "Only verified specialists can initiate chats" },
        { status: 403 }
      );
    }

    // Verify the experience post exists and is published
    const experiencePost = await prisma.experiencePost.findUnique({
      where: { id: params.postId },
    });

    if (!experiencePost || !experiencePost.published) {
      return NextResponse.json(
        { error: "Experience post not found" },
        { status: 404 }
      );
    }

    // Check if a chat session already exists for this post and specialist
    const existingChat = await prisma.chatSession.findFirst({
      where: {
        experiencePostId: params.postId,
        specialistId: specialist.id,
        status: "ACTIVE",
      },
    });

    if (existingChat) {
      return NextResponse.json(
        { error: "Chat session already exists", sessionId: existingChat.id },
        { status: 409 }
      );
    }

    const body = await request.json();
    const { initialMessage } = chatInitSchema.parse(body);

    // Generate anonymous identifier for the user
    // Format: "User #" + last 6 digits of user ID hash
    const userIdHash = randomBytes(4).toString("hex");
    const anonymousUserId = `User #${userIdHash.substring(0, 6).toUpperCase()}`;

    // Create chat session with anonymous identifier
    const chatSession = await prisma.chatSession.create({
      data: {
        userId: experiencePost.userId,
        specialistId: specialist.id,
        experiencePostId: params.postId,
        anonymousUserId,
        status: "ACTIVE",
      },
    });

    // Create the initial message from the specialist
    const message = await prisma.message.create({
      data: {
        sessionId: chatSession.id,
        senderId: specialist.userId,
        senderRole: "specialist",
        content: initialMessage,
      },
    });

    return NextResponse.json(
      {
        sessionId: chatSession.id,
        anonymousUserId,
        message,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error initiating chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

