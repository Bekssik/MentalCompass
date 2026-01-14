import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatSession = await prisma.chatSession.create({
      data: {
        userId: session.user.id,
        status: "ACTIVE",
      },
    });

    // Assign a specialist (simple assignment - in production, use a queue system)
    const availableSpecialists = await prisma.specialist.findMany({
      where: {
        isAvailable: true,
        certifications: {
          some: {
            status: "VERIFIED",
          },
        },
      },
      include: {
        chatSessions: {
          where: {
            status: "ACTIVE",
          },
        },
      },
    });

    if (availableSpecialists.length > 0) {
      // Assign specialist with least active chats
      const specialist = availableSpecialists.sort(
        (a: typeof availableSpecialists[0], b: typeof availableSpecialists[0]) => a.chatSessions.length - b.chatSessions.length
      )[0];

      await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: {
          specialistId: specialist.id,
        },
      });
    }

    return NextResponse.json(chatSession, { status: 201 });
  } catch (error) {
    console.error("Chat session creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

