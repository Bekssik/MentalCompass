"use client";

import { Card } from "@/components/ui/Card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Appointment {
  id: string;
  date: Date;
  status: string;
  specialist: {
    user: {
      name: string | null;
    };
  };
}

interface PersonalHistoryProps {
  appointments: Appointment[];
  locale: string;
}

export function PersonalHistory({
  appointments,
  locale,
}: PersonalHistoryProps) {
  const completedAppointments = appointments.filter(
    (apt) => apt.status === "COMPLETED"
  );

  return (
    <Card>
      <h2 className="text-2xl font-bold text-text mb-4">История консультаций</h2>
      {completedAppointments.length === 0 ? (
        <p className="text-text-light">У вас пока нет завершенных консультаций.</p>
      ) : (
        <div className="space-y-4">
          {completedAppointments.slice(0, 5).map((appointment) => (
            <div
              key={appointment.id}
              className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-text">
                    {appointment.specialist.user.name || "Специалист"}
                  </p>
                  <p className="text-sm text-text-light">
                    {format(new Date(appointment.date), "dd MMMM yyyy, HH:mm", {
                      locale: ru,
                    })}
                  </p>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  Завершена
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}











