"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useLocale } from "next-intl";
interface RecommendationItem {
  id: string;
  name: string | null;
  specialization: string | null;
  experience: number | null;
  pricePerHour: number | null;
  score: number;
}

interface RecommendationsProps {
  userId: string;
  locale: string;
}

export function Recommendations({ userId, locale }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch("/api/matching");
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  return (
    <Card>
      <h2 className="text-2xl font-bold text-text mb-4">Рекомендации</h2>
      {loading ? (
        <p className="text-text-light">Загрузка...</p>
      ) : recommendations.length === 0 ? (
        <p className="text-text-light">
          Пока нет рекомендаций. Пройдите оценку, чтобы получить персональные рекомендации.
        </p>
      ) : (
        <div className="space-y-4">
          {recommendations.map((specialist) => (
            <Link
              key={specialist.id}
              href={`/${locale}/specialists/${specialist.id}`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
            >
              <p className="font-semibold text-text">{specialist.name}</p>
              <p className="text-sm text-text-light">{specialist.specialization}</p>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

