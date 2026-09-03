"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("E-mail ou senha incorretos.");
      setCarregando(false);
      return;
    }

    // Verificar se é admin
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("admin")
      .eq("id", data.user.id)
      .single();

    if (!usuario?.admin) {
      await supabase.auth.signOut();
      setErro("Você não tem permissão de administrador.");
      setCarregando(false);
      return;
    }

    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50/30 px-4">
      <div className="w-full max-w-md rounded-2xl border border-brand-100 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <i className="fa-solid fa-lock text-2xl text-brand-600"></i>
          </div>
          <h1 className="text-2xl font-serif font-semibold text-neutral-900">
            Painel Administrativo
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Acesse para gerenciar sua loja
          </p>
        </div>

        {erro && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
              required
              className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-3 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label htmlFor="senha" className="mb-1 block text-sm font-medium text-neutral-700">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-3 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-full bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
