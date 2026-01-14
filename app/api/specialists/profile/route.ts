import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  biography: z.string(),
  specialization: z.string(),
  experience: z.number(),
  pricePerHour: z.number(),
  certificateUrl: z.string().optional(),
});

// GET - Get specialist profile and certifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const specialist = await prisma.specialist.findUnique({
      where: { userId: session.user.id },
      include: {
        certifications: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    if (!specialist) {
      return NextResponse.json({ error: "Not a specialist" }, { status: 404 });
    }

    return NextResponse.json(specialist);
  } catch (error) {
    console.error("Error fetching specialist profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = profileSchema.parse(body);

    // Find or create specialist
    let specialist = await prisma.specialist.findUnique({
      where: { userId: session.user.id },
    });

    if (!specialist) {
      specialist = await prisma.specialist.create({
        data: {
          userId: session.user.id,
          ...data,
        },
      });
    } else {
      specialist = await prisma.specialist.update({
        where: { id: specialist.id },
        data,
      });
    }

    // Create certification if certificate URL provided
    if (data.certificateUrl) {
      await prisma.certification.create({
        data: {
          specialistId: specialist.id,
          title: "Диплом/Сертификат",
          institution: "Загружено пользователем",
          fileUrl: data.certificateUrl,
          status: "PENDING",
        },
      });
    }

    return NextResponse.json(specialist);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}









