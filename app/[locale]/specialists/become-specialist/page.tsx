"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function BecomeSpecialistPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const [formData, setFormData] = useState({
    biography: "",
    specialization: "",
    experience: "",
    pricePerHour: "",
  });
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!session) {
    router.push(`/${locale}/login`);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Upload certificate if provided
      let certificateUrl = "";
      if (certificateFile) {
        const formData = new FormData();
        formData.append("file", certificateFile);
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          certificateUrl = uploadData.url;
        }
      }

      // Update specialist profile
      const response = await fetch("/api/specialists/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          experience: parseInt(formData.experience),
          pricePerHour: parseFloat(formData.pricePerHour),
          certificateUrl,
        }),
      });

      if (response.ok) {
        router.push(`/${locale}/dashboard`);
      } else {
        setError("Ошибка при сохранении профиля");
      }
    } catch (error) {
      setError("Ошибка при сохранении профиля");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text mb-6">
          Стать специалистом
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Биография
            </label>
            <textarea
              value={formData.biography}
              onChange={(e) =>
                setFormData({ ...formData, biography: e.target.value })
              }
              required
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Расскажите о себе, своем опыте и подходе к работе..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Специализация
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Психолог, Психиатр, и т.д."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Опыт (лет)
            </label>
            <input
              type="number"
              value={formData.experience}
              onChange={(e) =>
                setFormData({ ...formData, experience: e.target.value })
              }
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Цена за час (₸)
            </label>
            <input
              type="number"
              value={formData.pricePerHour}
              onChange={(e) =>
                setFormData({ ...formData, pricePerHour: e.target.value })
              }
              required
              min="0"
              step="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Сертификат/Диплом (PDF или изображение)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                setCertificateFile(e.target.files?.[0] || null)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-sm text-text-light mt-1">
              Сертификат будет проверен администратором перед публикацией профиля
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить профиль"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

