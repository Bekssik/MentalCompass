"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NewChatPage() {
  const router = useRouter();
  const locale = useLocale();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  if (!session) {
    router.push(`/${locale}/login`);
    return null;
  }

  const handleCreateChat = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/${locale}/chat/${data.id}`);
      } else {
        alert("Ошибка при создании чата");
      }
    } catch (error) {
      alert("Ошибка при создании чата");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text mb-4">Создать новый чат</h1>
        <p className="text-text-light mb-6">
          Вы можете начать анонимный чат со специалистом. Ваши личные данные не будут раскрыты.
        </p>
        <Button onClick={handleCreateChat} disabled={loading} className="w-full">
          {loading ? "Создание..." : "Создать чат"}
        </Button>
      </Card>
    </div>
  );
}

