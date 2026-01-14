"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function EditProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    profilePhoto: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPhoto, setCurrentPhoto] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || "",
            email: data.email || "",
            description: data.description || "",
            profilePhoto: null,
          });
          setCurrentPhoto(data.profilePhoto || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
    if (session) {
      fetchProfile();
    }
  }, [session]);

  if (!session) {
    router.push(`/${locale}/login`);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let photoUrl = currentPhoto;
      if (formData.profilePhoto) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.profilePhoto);
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          photoUrl = uploadData.url;
        }
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          profilePhoto: photoUrl,
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
        <h1 className="text-3xl font-bold text-text mb-6">Редактировать профиль</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Фото профиля
            </label>
            {currentPhoto && !formData.profilePhoto && (
              <img
                src={currentPhoto}
                alt="Current profile"
                className="w-24 h-24 rounded-full object-cover mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  profilePhoto: e.target.files?.[0] || null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Имя
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
            <p className="text-sm text-text-light mt-1">
              Email нельзя изменить
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              О себе (длинное описание)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Расскажите о себе..."
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

