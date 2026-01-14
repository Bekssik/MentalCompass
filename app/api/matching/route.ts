import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's assessment data
    const assessment = await prisma.assessment.findUnique({
      where: { userId: session.user.id },
    });

    // Get all verified specialists
    const specialists = await prisma.specialist.findMany({
      include: {
        user: true,
        certifications: {
          where: { status: "VERIFIED" },
        },
        reviews: true,
        _count: {
          select: { reviews: true },
        },
      },
    });

    // Simple matching algorithm - in production, this would be more sophisticated
    // For now, return specialists sorted by rating and experience
    const specialistsWithScore = specialists.map((specialist) => {
      const avgRating =
        specialist.reviews.length > 0
          ? specialist.reviews.reduce((sum: number, r) => sum + r.rating, 0) /
            specialist.reviews.length
          : 0;

      // Simple scoring based on rating, experience, and number of reviews
      const score =
        avgRating * 0.5 +
        (specialist.experience || 0) * 0.1 +
        Math.min(specialist._count.reviews, 20) * 0.05;

      return {
        id: specialist.id,
        name: specialist.user.name,
        specialization: specialist.specialization,
        experience: specialist.experience,
        pricePerHour: specialist.pricePerHour,
        score,
      };
    });

    // Sort by score and return top matches
    const matches = specialistsWithScore
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Matching API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

