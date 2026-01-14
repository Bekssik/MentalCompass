import { getSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { PersonalHistory } from "@/components/dashboard/PersonalHistory";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { UpcomingBookings } from "@/components/dashboard/UpcomingBookings";
import { ProfileSettings } from "@/components/dashboard/ProfileSettings";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      appointments: {
        include: {
          specialist: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: 10,
      },
    },
  });

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text mb-8">Личный кабинет</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <UpcomingBookings appointments={user.appointments} locale={locale} />
          <PersonalHistory appointments={user.appointments} locale={locale} />
          <Recommendations userId={user.id} locale={locale} />
        </div>
        <div>
          <ProfileSettings user={user} locale={locale} />
        </div>
      </div>
    </div>
  );
}








