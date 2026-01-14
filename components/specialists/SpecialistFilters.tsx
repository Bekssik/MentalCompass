"use client";

import { Card } from "@/components/ui/Card";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SpecialistFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    specialization: searchParams.get("specialization") || "",
    minExperience: searchParams.get("minExperience") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`?${params.toString()}`);
  };

  return (
    <Card>
      <h2 className="text-xl font-bold text-text mb-4">Фильтры</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Специализация
          </label>
          <input
            type="text"
            value={filters.specialization}
            onChange={(e) => handleFilterChange("specialization", e.target.value)}
            placeholder="Психолог, Психиатр..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Минимальный опыт (лет)
          </label>
          <input
            type="number"
            value={filters.minExperience}
            onChange={(e) => handleFilterChange("minExperience", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Максимальная цена (₸/час)
          </label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
    </Card>
  );
}











