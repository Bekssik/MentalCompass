"use client";

import { ChatInterface } from "@/components/ai/ChatInterface";
import { Card } from "@/components/ui/Card";

export default function AIAssistantPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <h1 className="text-3xl font-bold text-text mb-2">Mishka - AI Помощник</h1>
          <p className="text-text-light">
            Получите эмоциональную поддержку и помощь в навигации по платформе.
            Mishka не ставит диагнозы и не заменяет профессиональную помощь.
          </p>
        </Card>
        <ChatInterface />
      </div>
    </div>
  );
}






