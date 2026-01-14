"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

interface ChatInitiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
  isSubmitting: boolean;
}

export function ChatInitiationModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: ChatInitiationModalProps) {
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    await onSubmit(message);
    setMessage("");
  };

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text">Ответить</h2>
          <button
            onClick={handleClose}
            className="text-text-light hover:text-text transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-text-light mb-4">
          Ваш ответ будет опубликован публично под историей и одновременно станет первым сообщением в приватном чате с автором. Автор останется анонимным.
        </p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Напишите профессиональный и поддерживающий ответ..."
            className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            rows={5}
            required
            disabled={isSubmitting}
          />
          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={isSubmitting || !message.trim()}>
              {isSubmitting ? "Отправка..." : "Отправить ответ"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

