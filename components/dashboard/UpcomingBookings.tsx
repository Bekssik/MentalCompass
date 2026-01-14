"use client";

import { Card } from "@/components/ui/Card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";
import { useLocale } from "next-intl";

interface Appointment {
  id: string;
  date: Date;
  status: string;
  specialist: {
    id: string;
    user: {
      name: string | null;
    };
  };
}

interface UpcomingBookingsProps {
  appointments: Appointment[];
  locale: string;
}

export function UpcomingBookings({
  appointments,
  locale,
}: UpcomingBookingsProps) {
  const upcomingAppointments = appointments
    .filter(
      (apt) =>
        apt.status === "PENDING" ||
        apt.status === "CONFIRMED" &&
        new Date(apt.date) > new Date()
    )
    .slice(0, 5);

  return (
    <Card>
      <h2 className="text-2xl font-bold text-text mb-4">Ближайшие записи</h2>
      {upcomingAppointments.length === 0 ? (
        <p className="text-text-light">У вас нет предстоящих записей.</p>
      ) : (
        <div className="space-y-4">
          {upcomingAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/${locale}/specialists/${appointment.specialist.id}`}
                    className="font-semibold text-text hover:text-primary transition-colors"
                  >
                    {appointment.specialist.user.name || "Специалист"}
                  </Link>
                  <p className="text-sm text-text-light">
                    {format(new Date(appointment.date), "dd MMMM yyyy, HH:mm", {
                      locale: ru,
                    })}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    appointment.status === "CONFIRMED"
                      ? "bg-primary/10 text-primary"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {appointment.status === "CONFIRMED" ? "Подтверждена" : "Ожидает"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}











