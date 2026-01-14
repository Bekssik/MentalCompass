"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NewExperiencePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!session) {
    router.push(`/${locale}/login`);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        // Redirect to experiences page after showing success message
        setTimeout(() => {
          router.push(`/${locale}/experiences`);
        }, 2000);
      } else {
        setError("Ошибка при публикации истории");
      }
    } catch (error) {
      setError("Ошибка при публикации истории");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text mb-6">
          Поделиться историей (анонимно)
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
              Ваша история опубликована анонимно.
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Заголовок
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Ваша история
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Поделитесь своим опытом (анонимно)..."
            />
            <p className="text-sm text-text-light mt-2">
              Ваша история будет опубликована анонимно сразу после отправки.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Публикация..." : "Опубликовать"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

