"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CertificationWithRelations } from "@/types/prisma";

interface CertificationReviewProps {
  certification: CertificationWithRelations;
  locale: string;
}

export function CertificationReview({
  certification,
  locale,
}: CertificationReviewProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async (status: "VERIFIED" | "REJECTED") => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificationId: certification.id,
          status,
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Ошибка при обновлении статуса");
      }
    } catch (error) {
      alert("Ошибка при обновлении статуса");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-text mb-2">
            {certification.specialist.user.name}
          </h3>
          <p className="text-text-secondary mb-2">{certification.title}</p>
          <p className="text-sm text-text-light mb-4">
            {certification.institution}
          </p>
          {certification.fileUrl && (
            <div className="mb-4">
              <a
                href={certification.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Просмотреть сертификат
              </a>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleVerify("VERIFIED")}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            Одобрить
          </Button>
          <Button
            onClick={() => handleVerify("REJECTED")}
            disabled={loading}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50"
          >
            Отклонить
          </Button>
        </div>
      </div>
    </Card>
  );
}

