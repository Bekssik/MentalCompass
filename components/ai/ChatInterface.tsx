"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Привет! Я Mishka, ваш AI помощник. Чем я могу помочь вам сегодня? Помните, я не ставлю диагнозы и не заменяю профессиональную помощь.",
    },
  ]);
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const messageText = input.trim();
    console.log("🔵 [Chat UI] Sending message:", messageText);
    
    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const requestBody = {
        message: messageText,
        userId: session?.user?.id,
        conversationHistory: messages,
      };
      
      console.log("🔵 [Chat UI] Request body:", {
        hasMessage: !!requestBody.message,
        hasUserId: !!requestBody.userId,
        historyLength: requestBody.conversationHistory.length,
      });

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("🔵 [Chat UI] Response status:", response.status, response.statusText);

      let data;
      try {
        const text = await response.text();
        console.log("🔵 [Chat UI] Response text:", text.substring(0, 200));
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("❌ [Chat UI] Failed to parse response:", parseError);
        throw new Error("Не удалось обработать ответ сервера");
      }

      if (!response.ok) {
        // Проверяем оба поля: error и response
        const errorMessage = data.response || data.error || `HTTP error! status: ${response.status}`;
        console.error("❌ [Chat UI] Chat API error:", {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          response: data.response,
          fullData: data,
        });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: errorMessage },
        ]);
        return;
      }

      const assistantResponse = data.response || "Извините, не удалось получить ответ.";
      console.log("✅ [Chat UI] Received response:", {
        hasResponse: !!data.response,
        responseLength: assistantResponse.length,
        responsePreview: assistantResponse.substring(0, 100),
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantResponse },
      ]);
    } catch (error) {
      console.error("❌ [Chat UI] Chat error:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
      const userFriendlyMessage = errorMessage.includes("HTTP error") || errorMessage.includes("Failed to fetch")
        ? "Извините, не удалось подключиться к серверу. Пожалуйста, проверьте подключение к интернету и попробуйте снова."
        : `Извините, произошла ошибка: ${errorMessage}. Пожалуйста, попробуйте снова.`;
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: userFriendlyMessage,
        },
      ]);
    } finally {
      setLoading(false);
      console.log("🔵 [Chat UI] Request completed");
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-primary text-white"
                  : "bg-background-subtle text-text"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-background-subtle rounded-lg p-4">
              <p className="text-text-light">Печатает...</p>
            </div>
          </div>
        )}
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






