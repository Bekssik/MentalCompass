"use client";

import { Card } from "@/components/ui/Card";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    name: string | null;
  };
}

interface ReviewSectionProps {
  reviews: Review[];
  specialistId: string;
  locale: string;
}

export function ReviewSection({
  reviews,
  specialistId,
  locale,
}: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialistId,
          rating,
          comment,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setComment("");
        window.location.reload();
      } else {
        alert("Ошибка при отправке отзыва");
      }
    } catch (error) {
      alert("Ошибка при отправке отзыва");
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-text">Отзывы</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Отмена" : "Оставить отзыв"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-background-subtle rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-text mb-2">
              Рейтинг
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? "fill-primary text-primary"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text mb-2">
              Комментарий
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={4}
            />
          </div>
          <Button type="submit">Отправить</Button>
        </form>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-text-light">Пока нет отзывов.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? "fill-primary text-primary"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-text">
                  {review.user.name || "Аноним"}
                </span>
                <span className="text-sm text-text-light">
                  {format(new Date(review.createdAt), "dd MMMM yyyy", {
                    locale: ru,
                  })}
                </span>
              </div>
              {review.comment && (
                <p className="text-text">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

