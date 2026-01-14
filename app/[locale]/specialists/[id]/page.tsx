import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SpecialistProfile } from "@/components/specialists/SpecialistProfile";
import { ReviewSection } from "@/components/specialists/ReviewSection";
import { BookingCalendar } from "@/components/specialists/BookingCalendar";
import { SpecialistWithRelations } from "@/types/prisma";

export default async function SpecialistDetailPage({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  const specialist = await prisma.specialist.findUnique({
    where: { id },
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
        orderBy: {
          createdAt: "desc",
        },
      },
      availabilities: true,
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  if (!specialist) {
    notFound();
  }

  const avgRating =
    specialist.reviews.length > 0
      ? specialist.reviews.reduce((sum: number, review) => sum + review.rating, 0) /
        specialist.reviews.length
      : 0;
  
  const specialistWithRelations: SpecialistWithRelations = specialist;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <SpecialistProfile specialist={specialistWithRelations} avgRating={avgRating} />
          <ReviewSection reviews={specialist.reviews} specialistId={specialist.id} locale={locale} />
        </div>
        <div>
          <BookingCalendar specialist={specialistWithRelations} locale={locale} />
        </div>
      </div>
    </div>
  );
}

