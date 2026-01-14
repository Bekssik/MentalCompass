"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { SpecialistForChat } from "@/types/prisma";

interface Message {
  id: string;
  senderId: string | null;
  senderRole: string;
  content: string;
  createdAt: Date;
}

interface ChatWindowProps {
  sessionId: string;
  initialMessages: Message[];
  specialist: SpecialistForChat;
  anonymousUserId?: string | null;
  isSpecialistView?: boolean;
  locale: string;
}

export function ChatWindow({
  sessionId,
  initialMessages,
  specialist,
  anonymousUserId,
  isSpecialistView = false,
  locale,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          content: userMessage,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage]);
      } else {
        alert("Ошибка при отправке сообщения");
      }
    } catch (error) {
      alert("Ошибка при отправке сообщения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xl font-bold text-text">
          {isSpecialistView
            ? `Чат с ${anonymousUserId || "пользователем"}`
            : specialist
            ? `Чат со специалистом: ${specialist.user.name}`
            : "Ожидание назначения специалиста"}
        </h2>
        <p className="text-sm text-text-light">
          {isSpecialistView
            ? "Личные данные пользователя не раскрываются. Вы видите только анонимный идентификатор."
            : "Ваши личные данные не раскрываются. Чат полностью анонимен."}
        </p>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderRole === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.senderRole === "user"
                  ? "bg-primary text-white"
                  : "bg-background-subtle text-text"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введите ваше сообщение..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}

