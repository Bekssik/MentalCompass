"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { SpecialistWithRelations } from "@/types/prisma";

interface BookingCalendarProps {
  specialist: SpecialistWithRelations;
  locale: string;
}

export function BookingCalendar({ specialist, locale }: BookingCalendarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!session) {
      router.push(`/${locale}/login`);
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert("Пожалуйста, выберите дату и время");
      return;
    }

    setLoading(true);
    try {
      const dateTime = new Date(`${selectedDate}T${selectedTime}`);
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialistId: specialist.id,
          date: dateTime.toISOString(),
          duration: 60,
        }),
      });

      if (response.ok) {
        alert("Запись успешно создана!");
        router.refresh();
      } else {
        alert("Ошибка при создании записи");
      }
    } catch (error) {
      alert("Ошибка при создании записи");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-text mb-4">Записаться на консультацию</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Дата
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Время
          </label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <Button
          onClick={handleBooking}
          className="w-full"
          disabled={loading || !selectedDate || !selectedTime}
        >
          {loading ? "Бронирование..." : "Записаться"}
        </Button>
        {specialist.pricePerHour && (
          <p className="text-center text-text-light">
            Стоимость: {specialist.pricePerHour.toFixed(0)} ₸/час
          </p>
        )}
      </div>
    </Card>
  );
}

