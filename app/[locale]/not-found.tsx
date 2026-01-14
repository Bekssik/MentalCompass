import { useTranslations } from "next-intl";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text mb-4">404</h1>
        <p className="text-text-light">Страница не найдена</p>
      </div>
    </div>
  );
}











