import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "crypto";

const replySchema = z.object({
  content: z.string().min(1),
});

// POST - Create a public response and private chat session in one action
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
        { error: "Only verified specialists can reply" },
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
        {
          error: "Chat session already exists",
          sessionId: existingChat.id,
          response: null,
        },
        { status: 409 }
      );
    }

    const body = await request.json();
    const { content } = replySchema.parse(body);

    // Generate anonymous identifier for the user
    // Format: "User #" + 6 character hex string
    const userIdHash = randomBytes(4).toString("hex");
    const anonymousUserId = `User #${userIdHash.substring(0, 6).toUpperCase()}`;

    // Create both the public response and chat session in a transaction
    const [response, chatSession] = await prisma.$transaction([
      // Create public response
      prisma.experiencePostResponse.create({
        data: {
          experiencePostId: params.postId,
          specialistId: specialist.id,
          content,
        },
        include: {
          specialist: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profilePhoto: true,
                },
              },
              certifications: {
                where: {
                  status: "VERIFIED",
                },
                take: 1,
              },
            },
          },
        },
      }),
      // Create chat session with anonymous identifier
      prisma.chatSession.create({
        data: {
          userId: experiencePost.userId,
          specialistId: specialist.id,
          experiencePostId: params.postId,
          anonymousUserId,
          status: "ACTIVE",
        },
      }),
    ]);

    // Create the first chat message from the specialist
    const message = await prisma.message.create({
      data: {
        sessionId: chatSession.id,
        senderId: specialist.userId,
        senderRole: "specialist",
        content,
      },
    });

    return NextResponse.json(
      {
        response,
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
    console.error("Error creating reply:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

