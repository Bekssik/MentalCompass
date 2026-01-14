import { getSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CertificationReview } from "@/components/admin/CertificationReview";

export default async function VerificationsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect(`/${locale}/dashboard`);
  }

  const certifications = await prisma.certification.findMany({
    where: { status: "PENDING" },
    include: {
      specialist: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text mb-8">
        Проверка сертификатов
      </h1>
      <div className="space-y-6">
        {certifications.length === 0 ? (
          <p className="text-text-light">Нет сертификатов на проверку.</p>
        ) : (
          certifications.map((cert: typeof certifications[0]) => (
            <CertificationReview key={cert.id} certification={cert} locale={locale} />
          ))
        )}
      </div>
    </div>
  );
}

