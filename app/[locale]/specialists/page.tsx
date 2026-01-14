import { prisma } from "@/lib/prisma";
import { SpecialistCard } from "@/components/specialists/SpecialistCard";
import { SpecialistFilters } from "@/components/specialists/SpecialistFilters";
import { SpecialistWithRelations } from "@/types/prisma";

interface SearchParams {
  search?: string;
  specialization?: string;
  minExperience?: string;
  maxPrice?: string;
}

export default async function SpecialistsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: SearchParams;
}) {
  const where: {
    specialization?: string;
    experience?: { gte?: number };
    pricePerHour?: { lte?: number };
  } = {};

  if (searchParams.specialization) {
    where.specialization = searchParams.specialization;
  }

  if (searchParams.minExperience) {
    where.experience = { gte: parseInt(searchParams.minExperience) };
  }

  if (searchParams.maxPrice) {
    where.pricePerHour = { lte: parseFloat(searchParams.maxPrice) };
  }

  let specialists: SpecialistWithRelations[] = [];
  
  try {
    specialists = await prisma.specialist.findMany({
      where,
      include: {
        user: true,
        certifications: {
          where: {
            status: "VERIFIED",
          },
        },
        reviews: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });
  } catch (error) {
    // Handle database connection errors gracefully
    console.error("Database connection error:", error);
    specialists = [];
  }

  // Calculate average ratings
  const specialistsWithRatings = specialists.map((specialist) => {
    const avgRating =
      specialist.reviews.length > 0
        ? specialist.reviews.reduce((sum: number, review: SpecialistWithRelations['reviews'][number]) => sum + review.rating, 0) /
          specialist.reviews.length
        : 0;
    return { ...specialist, avgRating };
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text mb-8">Специалисты</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <SpecialistFilters />
        </div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {specialistsWithRatings.map((specialist) => (
              <SpecialistCard
                key={specialist.id}
                specialist={specialist}
                locale={locale}
              />
            ))}
          </div>
          {specialistsWithRatings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-light">Специалисты не найдены.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

