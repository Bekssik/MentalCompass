import { getSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default async function ChatPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Check if user is a verified specialist
  const specialist = await prisma.specialist.findUnique({
    where: { userId: session.user.id },
    include: {
      certifications: {
        where: {
          status: "VERIFIED",
        },
      },
    },
  });

  const isVerifiedSpecialist = specialist && specialist.certifications.length > 0;

  // Fetch chats based on user role
  let chatSessions;
  if (isVerifiedSpecialist) {
    // For specialists: show chats where they are the assigned specialist
    chatSessions = await prisma.chatSession.findMany({
      where: { specialistId: specialist.id },
      include: {
        experiencePost: {
          select: {
            id: true,
            title: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  } else {
    // For regular users: show chats where they are the user
    chatSessions = await prisma.chatSession.findMany({
      where: { userId: session.user.id },
      include: {
        specialist: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-text">Анонимный чат</h1>
        {!isVerifiedSpecialist && (
          <Link href={`/${locale}/chat/new`}>
            <Button>Новый чат</Button>
          </Link>
        )}
      </div>
      <div className="space-y-4">
        {chatSessions.length === 0 ? (
          <Card>
            <p className="text-text-light text-center py-8">
              {isVerifiedSpecialist
                ? "У вас пока нет чатов с пользователями."
                : "У вас пока нет чатов. Создайте новый чат для связи со специалистом."}
            </p>
          </Card>
        ) : (
          chatSessions.map((chatSession: typeof chatSessions[0]) => (
            <Link key={chatSession.id} href={`/${locale}/chat/${chatSession.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text mb-2">
                      {isVerifiedSpecialist ? (
                        <>
                          Чат с {chatSession.anonymousUserId || "пользователем"}
                          {chatSession.experiencePost && (
                            <span className="text-sm font-normal text-text-light ml-2">
                              • {chatSession.experiencePost.title}
                            </span>
                          )}
                        </>
                      ) : (
                        chatSession.specialist
                          ? `Чат со специалистом: ${chatSession.specialist.user.name}`
                          : "Ожидание специалиста"
                      )}
                    </h3>
                    {chatSession.messages[0] && (
                      <p className="text-text-light text-sm line-clamp-2">
                        {chatSession.messages[0].content}
                      </p>
                    )}
                    <p className="text-text-light text-xs mt-2">
                      {format(new Date(chatSession.updatedAt), "dd MMMM yyyy, HH:mm", {
                        locale: ru,
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      chatSession.status === "ACTIVE"
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {chatSession.status === "ACTIVE" ? "Активен" : "Закрыт"}
                  </span>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

