import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

import "./globals.css";

import { Role } from "@prisma/client";

import { Providers } from "./providers";
import { getServerAuthSession } from "@/shared/auth/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "СтаффТехнолоджи",
  description: "HR-платформа для соискателей, работодателей и администраторов",
};

const links = [
  { href: "/", label: "Главная" },
  { href: "/jobs/search", label: "Вакансии" },
  { href: "/resumes/search", label: "Резюме" },
];

const roleLinks: Record<Role, { href: string; label: string }> = {
  APPLICANT: {
    href: "/applicant/dashboard",
    label: "Кабинет соискателя",
  },
  EMPLOYER: {
    href: "/employer/dashboard",
    label: "Кабинет работодателя",
  },
  ADMIN: {
    href: "/admin/dashboard",
    label: "Админ-панель",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session: Awaited<ReturnType<typeof getServerAuthSession>> | null = null;

  try {
    session = await getServerAuthSession();
  } catch (error) {
    console.error("Failed to load auth session", error);
    session = null;
  }
  const role = session?.user?.role;
  const dashboardLink = role ? roleLinks[role] : null;

  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 font-sans antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col bg-slate-50">
            <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
                <Link href="/" className="text-lg font-semibold text-slate-900">
                  СтаффТехнолоджи
                </Link>
                <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="transition hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href={dashboardLink?.href ?? "/auth/login"}
                    className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
                  >
                    {dashboardLink?.label ?? "Войти"}
                  </Link>
                </nav>
              </div>
            </header>
            <main className="flex-1">
              <div className="mx-auto w-full max-w-6xl px-6 py-10">
                {children}
              </div>
            </main>
            <footer className="border-t border-slate-200/60 bg-white/90 py-6">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>© {new Date().getFullYear()} СтаффТехнолоджи</span>
                <span>
                  Сделано для демонстрации возможностей платформы найма
                </span>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
