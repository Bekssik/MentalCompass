"use client";

import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";
import { User } from "@prisma/client";

interface ProfileSettingsProps {
  user: User;
  locale: string;
}

export function ProfileSettings({ user, locale }: ProfileSettingsProps) {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-text mb-4">Профиль</h2>
      <div className="space-y-4">
        {user.profilePhoto && (
          <div className="flex justify-center">
            <img
              src={user.profilePhoto}
              alt={user.name || "Profile"}
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>
        )}
        <div>
          <p className="text-sm text-text-light">Имя</p>
          <p className="font-semibold text-text">{user.name || "Не указано"}</p>
        </div>
        <div>
          <p className="text-sm text-text-light">Email</p>
          <p className="font-semibold text-text">{user.email}</p>
        </div>
        {user.description && (
          <div>
            <p className="text-sm text-text-light">Описание</p>
            <p className="text-text">{user.description}</p>
          </div>
        )}
        <Link href={`/${locale}/profile/edit`}>
          <Button variant="outline" className="w-full">
            Редактировать профиль
          </Button>
        </Link>
      </div>
    </Card>
  );
}

