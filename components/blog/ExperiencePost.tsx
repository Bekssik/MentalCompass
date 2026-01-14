"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ExperiencePostWithRelations, ExperiencePostAnonymous } from "@/types/prisma";
import { ExperiencePostResponse } from "./ExperiencePostResponse";
import { ChatInitiationModal } from "./ChatInitiationModal";

interface ExperiencePostProps {
  post: ExperiencePostWithRelations | ExperiencePostAnonymous;
  locale: string;
}

interface ResponseData {
  id: string;
  content: string;
  createdAt: Date | string;
  specialist: {
    id: string;
    user: {
      id: string;
      name: string | null;
      profilePhoto: string | null;
    };
    certifications: Array<{ id: string; status: string }>;
  };
}

export function ExperiencePost({ post, locale }: ExperiencePostProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSpecialist, setIsSpecialist] = useState(false);
  const [existingChatSessionId, setExistingChatSessionId] = useState<string | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResponses();
  }, []);

  useEffect(() => {
    if (session) {
      checkSpecialistStatus();
    }
  }, [session]);

  useEffect(() => {
    if (isSpecialist && session) {
      checkExistingChat();
    }
  }, [isSpecialist, session, post.id]);

  const fetchResponses = async () => {
    try {
      const res = await fetch(`/api/experiences/${post.id}/responses`);
      if (res.ok) {
        const data = await res.json();
        setResponses(data);
      }
    } catch (error) {
      console.error("Error fetching responses:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkSpecialistStatus = async () => {
    if (!session) return;
    
    try {
      const res = await fetch("/api/specialists/profile");
      if (res.ok) {
        const data = await res.json();
        // Check if user has verified certifications
        if (data.certifications?.some((c: { status: string }) => c.status === "VERIFIED")) {
          setIsSpecialist(true);
        }
      }
    } catch (error) {
      // Not a specialist or error, which is fine
    }
  };

  const checkExistingChat = async () => {
    if (!session || !isSpecialist) return;
    
    try {
      const res = await fetch(`/api/experiences/${post.id}/chat`);
      if (res.ok) {
        const data = await res.json();
        if (data.exists && data.sessionId) {
          setExistingChatSessionId(data.sessionId);
        }
      }
    } catch (error) {
      // No existing chat, which is fine
    }
  };


  const handleReply = () => {
    if (!session) {
      router.push(`/${locale}/login`);
      return;
    }
    setShowReplyModal(true);
  };

  const handleReplySubmit = async (message: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/experiences/${post.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });

      if (res.ok) {
        const data = await res.json();
        // Refresh responses to get the latest data
        await fetchResponses();
        // Set the chat session ID
        setExistingChatSessionId(data.sessionId);
        setShowReplyModal(false);
        // Redirect to chat session
        router.push(`/${locale}/chat/${data.sessionId}`);
      } else if (res.status === 409) {
        // Chat already exists, just redirect
        const data = await res.json();
        setExistingChatSessionId(data.sessionId);
        setShowReplyModal(false);
        router.push(`/${locale}/chat/${data.sessionId}`);
      } else {
        const error = await res.json();
        alert(error.error || "Ошибка при отправке ответа");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("Ошибка при отправке ответа");
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <h3 className="text-2xl font-bold text-text mb-2">{post.title}</h3>
      <p className="text-text-light text-sm mb-4">
        {format(new Date(post.createdAt), "dd MMMM yyyy", { locale: ru })}
      </p>
      <div className="text-text whitespace-pre-line mb-6">{post.content}</div>

      {/* Specialist Actions */}
      {isSpecialist && (
        <div className="flex gap-4 mb-6 pt-4 border-t">
          {existingChatSessionId ? (
            <Button
              variant="primary"
              onClick={() => router.push(`/${locale}/chat/${existingChatSessionId}`)}
            >
              Открыть чат
            </Button>
          ) : (
            <Button variant="primary" onClick={handleReply}>
              Ответить
            </Button>
          )}
        </div>
      )}

      {/* Responses */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-text mb-4">
          Ответы специалистов ({responses.length})
        </h4>
        {loading ? (
          <p className="text-text-light">Загрузка...</p>
        ) : responses.length === 0 ? (
          <p className="text-text-light">Пока нет ответов от специалистов.</p>
        ) : (
          <div>
            {responses.map((response) => (
              <ExperiencePostResponse key={response.id} response={response} />
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      <ChatInitiationModal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        onSubmit={handleReplySubmit}
        isSubmitting={submitting}
      />
    </Card>
  );
}

