"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function PerfilPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/perfil/conta");
      }
    });
  }, [supabase, router]);

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

    window.location.href = "/perfil/conta";
  };

  const handleGoogleLogin = async () => {
    setErro("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/perfil/conta`,
      },
    });
    if (error) {
      setErro("Erro ao entrar com Google.");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-brand-100 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <i className="fa-solid fa-user text-2xl text-brand-600"></i>
          </div>
          <h1 className="text-2xl font-serif font-semibold text-neutral-900">
            Entrar na sua conta
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Acesse seus pedidos, favoritos e muito mais.
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
              placeholder="seu@email.com"
              required
              className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-3 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label htmlFor="senha" className="mb-1 block text-sm font-medium text-neutral-700">
              Senha
            </label>
            <div className="relative">
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-3 pr-12 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-600"
              >
                <i className={`fa-solid ${mostrarSenha ? "fa-eye-slash" : "fa-eye"} text-sm`}></i>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-neutral-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
              />
              Lembrar de mim
            </label>
            <Link href="/perfil/esqueci-senha" className="text-brand-600 transition hover:text-brand-700">
              Esqueci a senha
            </Link>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-full bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-brand-100"></div>
          <span className="text-xs text-neutral-400">ou</span>
          <div className="h-px flex-1 bg-brand-100"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-brand-200 bg-white py-3 text-sm font-medium text-neutral-700 transition hover:bg-brand-50/50"
        >
          <i className="fa-brands fa-google text-base text-red-500"></i>
          Continuar com Google
        </button>

        <p className="mt-8 text-center text-sm text-neutral-500">
          Não tem uma conta?{" "}
          <Link href="/perfil/cadastro" className="font-medium text-brand-600 transition hover:text-brand-700">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
