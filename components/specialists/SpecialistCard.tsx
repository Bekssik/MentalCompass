"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Star } from "lucide-react";
import { SpecialistWithRelations } from "@/types/prisma";

interface SpecialistCardProps {
  specialist: SpecialistWithRelations & { avgRating?: number };
  locale: string;
}

export function SpecialistCard({ specialist, locale }: SpecialistCardProps) {
  const avgRating = specialist.avgRating ?? 0;
  const reviewCount = specialist._count?.reviews ?? 0;

  return (
    <Link href={`/${locale}/specialists/${specialist.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex flex-col h-full">
          {specialist.user.profilePhoto && (
            <img
              src={specialist.user.profilePhoto}
              alt={specialist.user.name || "Specialist"}
              className="w-20 h-20 rounded-full object-cover mb-4 mx-auto"
            />
          )}
          <h3 className="text-xl font-bold text-text mb-2 text-center">
            {specialist.user.name || "Специалист"}
          </h3>
          {specialist.specialization && (
            <p className="text-text-secondary mb-2 text-center">
              {specialist.specialization}
            </p>
          )}
          {specialist.experience && specialist.experience > 0 && (
            <p className="text-sm text-text-light mb-2 text-center">
              Опыт: {specialist.experience} лет
            </p>
          )}
          {reviewCount > 0 && avgRating > 0 ? (
            <div className="flex items-center justify-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="text-sm text-text">
                {avgRating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          ) : null}
          {specialist.pricePerHour && specialist.pricePerHour > 0 && (
            <p className="text-lg font-semibold text-primary text-center mt-auto">
              {specialist.pricePerHour.toFixed(0)} ₸/час
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}

