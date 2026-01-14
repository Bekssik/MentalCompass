import { getSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { notFound } from "next/navigation";

export default async function ChatSessionPage({
  params: { sessionId, locale },
}: {
  params: { sessionId: string; locale: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login`);
  }

  const chatSession = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      specialist: {
        include: {
          user: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!chatSession) {
    notFound();
  }

  // Check if user is the owner or the assigned specialist
  const isUser = chatSession.userId === session.user.id;
  const isSpecialist = chatSession.specialistId && 
                      chatSession.specialist?.userId === session.user.id;

  if (!isUser && !isSpecialist) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ChatWindow
        sessionId={sessionId}
        initialMessages={chatSession.messages}
        specialist={chatSession.specialist}
        anonymousUserId={chatSession.anonymousUserId}
        isSpecialistView={isSpecialist}
        locale={locale}
      />
    </div>
  );
}









