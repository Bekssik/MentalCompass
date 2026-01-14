import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const responseSchema = z.object({
  content: z.string().min(1),
});

// GET - Get all responses for an experience post
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;

    const responses = await prisma.experiencePostResponse.findMany({
      where: { experiencePostId: postId },
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
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a public response (specialists only)
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
        { error: "Only verified specialists can respond" },
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

    const body = await request.json();
    const { content } = responseSchema.parse(body);

    const response = await prisma.experiencePostResponse.create({
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
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

