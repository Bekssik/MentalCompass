"use client";

import { Card } from "@/components/ui/Card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Image from "next/image";

interface SpecialistInfo {
  id: string;
  name: string | null;
  profilePhoto: string | null;
}

interface ResponseData {
  id: string;
  content: string;
  createdAt: Date | string;
  specialist: {
    id: string;
    user: SpecialistInfo;
    certifications: Array<{ id: string; status: string }>;
  };
}

interface ExperiencePostResponseProps {
  response: ResponseData;
}

export function ExperiencePostResponse({ response }: ExperiencePostResponseProps) {
  return (
    <Card className="mt-4 ml-8 border-l-4 border-primary">
      <div className="flex items-start gap-4">
        {response.specialist.user.profilePhoto ? (
          <Image
            src={response.specialist.user.profilePhoto}
            alt={response.specialist.user.name || "Specialist"}
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-semibold">
              {response.specialist.user.name?.[0]?.toUpperCase() || "S"}
            </span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-text">
              {response.specialist.user.name || "Специалист"}
            </h4>
            {response.specialist.certifications.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                ✓ Проверен
              </span>
            )}
          </div>
          <p className="text-text-light text-sm mb-2">
            {format(new Date(response.createdAt), "dd MMMM yyyy, HH:mm", { locale: ru })}
          </p>
          <div className="text-text whitespace-pre-line">{response.content}</div>
        </div>
      </div>
    </Card>
  );
}

