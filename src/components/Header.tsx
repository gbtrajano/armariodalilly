"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/lib/supabase";

export default function Header() {
  const abrirCarrinho = useCartStore((s) => s.abrirCarrinho);
  const totalItens = useCartStore((s) => s.totalItens());
  const [logado, setLogado] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const checkAdminStatus = async () => {
      try {
        const res = await fetch("/api/auth/is-admin");
        const json = await res.json();
        setIsAdmin(!!json.isAdmin);
      } catch {
        setIsAdmin(false);
      }
    };

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setLogado(!!session);
      if (session) {
        await checkAdminStatus();
      } else {
        setIsAdmin(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLogado(!!session);
      if (session) {
        await checkAdminStatus();
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-tight text-brand-700">
          Armário da Lilly
        </Link>

        <nav className="hidden gap-6 text-sm font-medium text-neutral-700 md:flex">
          <Link href="/produtos" className="hover:text-brand-600">
            Todos os produtos
          </Link>
          <Link href="/produtos?categoria=Vestidos" className="hover:text-brand-600">
            Vestidos
          </Link>
          <Link href="/produtos?categoria=Blusas" className="hover:text-brand-600">
            Blusas
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={abrirCarrinho}
            className="relative flex items-center justify-center rounded-full border border-brand-300 w-10 h-10 text-brand-700 transition hover:bg-brand-50"
            aria-label="Abrir carrinho"
          >
            <i className="fa-solid fa-cart-shopping text-base"></i>
            {totalItens > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs text-white">
                {totalItens}
              </span>
            )}
          </button>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center justify-center rounded-full border border-brand-300 w-10 h-10 text-brand-700 transition hover:bg-brand-50"
              aria-label="Painel administrativo"
            >
              <i className="fa-solid fa-gear text-base"></i>
            </Link>
          )}

          <Link
            href={logado ? "/perfil/conta" : "/perfil"}
            className="flex items-center justify-center rounded-full border border-brand-300 w-10 h-10 text-brand-700 transition hover:bg-brand-50"
            aria-label="Meu perfil"
          >
            <i className="fa-solid fa-user text-base"></i>
          </Link>
        </div>
      </div>
    </header>
  );
}
