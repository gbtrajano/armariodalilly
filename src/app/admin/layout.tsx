"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "fa-chart-line" },
  { href: "/admin/produtos", label: "Produtos", icon: "fa-shirt" },
  { href: "/admin/promocoes", label: "Promoções", icon: "fa-tags" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "fa-box" },
  { href: "/admin/usuarios", label: "Usuários", icon: "fa-users" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [menuAberto, setMenuAberto] = useState(false);

  // Na página de login, não mostrar o layout do admin
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-brand-100 bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-brand-100 px-6 py-5">
            <Link href="/admin" className="font-serif text-xl font-semibold text-brand-700">
              Armário da Lilly
            </Link>
            <p className="mt-1 text-xs text-neutral-400">Painel Administrativo</p>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  pathname === item.href
                    ? "bg-brand-50 text-brand-700"
                    : "text-neutral-600 hover:bg-brand-50/50 hover:text-neutral-800"
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-brand-100 px-3 py-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-brand-50/50 hover:text-neutral-800"
            >
              <i className="fa-solid fa-arrow-left w-5 text-center"></i>
              Ver loja
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
            >
              <i className="fa-solid fa-right-from-bracket w-5 text-center"></i>
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col md:hidden">
        <header className="flex items-center justify-between border-b border-brand-100 bg-white px-4 py-3">
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="text-neutral-600"
          >
            <i className="fa-solid fa-bars text-lg"></i>
          </button>
          <Link href="/admin" className="font-serif text-lg font-semibold text-brand-700">
            Admin
          </Link>
          <button onClick={handleLogout} className="text-neutral-600">
            <i className="fa-solid fa-right-from-bracket text-lg"></i>
          </button>
        </header>

        {menuAberto && (
          <nav className="border-b border-brand-100 bg-white px-4 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuAberto(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  pathname === item.href
                    ? "bg-brand-50 text-brand-700"
                    : "text-neutral-600 hover:bg-brand-50/50"
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <main className="flex-1 p-4">{children}</main>
      </div>

      {/* Desktop content */}
      <main className="hidden flex-1 p-8 md:block">{children}</main>
    </div>
  );
}
