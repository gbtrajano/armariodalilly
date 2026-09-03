"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function ContaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/perfil");
        return;
      }
      setUser(session.user);

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("admin")
        .eq("id", session.user.id)
        .single();

      setIsAdmin(!!usuario?.admin);
      setCarregando(false);
    });
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (carregando) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-neutral-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-brand-100 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <i className="fa-solid fa-user text-2xl text-brand-600"></i>
          </div>
          <h1 className="text-2xl font-serif font-semibold text-neutral-900">
            Minha conta
          </h1>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-brand-50/50 p-4">
            <p className="text-xs text-neutral-500">E-mail</p>
            <p className="text-sm font-medium text-neutral-800">{user?.email}</p>
          </div>

          <div className="rounded-xl bg-brand-50/50 p-4">
            <p className="text-xs text-neutral-500">Membro desde</p>
            <p className="text-sm font-medium text-neutral-800">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("pt-BR")
                : "—"}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <i className="fa-solid fa-gauge-high"></i>
              Área administrativa
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full rounded-full border border-brand-200 py-3 text-sm font-medium text-neutral-700 transition hover:bg-brand-50/50"
          >
            <i className="fa-solid fa-right-from-bracket mr-2"></i>
            Sair da conta
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link href="/" className="text-brand-600 transition hover:text-brand-700">
            ← Voltar para a loja
          </Link>
        </p>
      </div>
    </div>
  );
}
