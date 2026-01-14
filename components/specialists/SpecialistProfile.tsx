"use client";

import { Card } from "@/components/ui/Card";
import { Star, Award, Calendar } from "lucide-react";
import { SpecialistWithRelations } from "@/types/prisma";

interface SpecialistProfileProps {
  specialist: SpecialistWithRelations;
  avgRating: number;
}

export function SpecialistProfile({
  specialist,
  avgRating,
}: SpecialistProfileProps) {
  return (
    <Card>
      <div className="flex flex-col md:flex-row gap-6">
        {specialist.user.profilePhoto && (
          <img
            src={specialist.user.profilePhoto}
            alt={specialist.user.name || "Specialist"}
            className="w-32 h-32 rounded-full object-cover"
          />
        )}
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-text mb-2">
            {specialist.user.name || "Специалист"}
          </h1>
          {specialist.specialization && (
            <p className="text-xl text-text-secondary mb-4">
              {specialist.specialization}
            </p>
          )}
          {avgRating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 fill-primary text-primary" />
              <span className="text-lg font-semibold text-text">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-text-light">
                ({specialist.reviews.length} отзывов)
              </span>
            </div>
          )}
          {specialist.experience && (
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-text">Опыт: {specialist.experience} лет</span>
            </div>
          )}
          {specialist.pricePerHour && (
            <p className="text-2xl font-bold text-primary mb-4">
              {specialist.pricePerHour.toFixed(0)} ₸/час
            </p>
          )}
        </div>
      </div>

      {specialist.biography && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-text mb-4">О специалисте</h2>
          <p className="text-text whitespace-pre-line">{specialist.biography}</p>
        </div>
      )}

      {specialist.certifications.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-text mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Сертификаты и дипломы
          </h2>
          <div className="space-y-3">
            {specialist.certifications.map((cert) => (
              <div key={cert.id} className="p-4 bg-background-subtle rounded-lg">
                <p className="font-semibold text-text">{cert.title}</p>
                <p className="text-sm text-text-light">{cert.institution}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

