"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [termos, setTermos] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (!termos) {
      setErro("Você precisa aceitar os termos de uso.");
      return;
    }

    setCarregando(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { name: nome },
      },
    });

    if (error) {
      setErro(error.message.includes("already registered")
        ? "Este e-mail já está cadastrado."
        : error.message);
      setCarregando(false);
      return;
    }

    setSucesso(true);
    setCarregando(false);
  };

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/perfil`,
      },
    });
  };

  if (sucesso) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl border border-brand-100 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <i className="fa-solid fa-check text-2xl text-green-600"></i>
          </div>
          <h1 className="text-2xl font-serif font-semibold text-neutral-900">Conta criada!</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Verifique seu e-mail para confirmar o cadastro. Depois, faça login normalmente.
          </p>
          <button
            onClick={() => router.push("/perfil")}
            className="mt-6 rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-brand-100 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <i className="fa-solid fa-user-plus text-2xl text-brand-600"></i>
          </div>
          <h1 className="text-2xl font-serif font-semibold text-neutral-900">
            Criar sua conta
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Cadastre-se para acompanhar seus pedidos e receber novidades.
          </p>
        </div>

        {erro && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="mb-1 block text-sm font-medium text-neutral-700">
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              required
              className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-3 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

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
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
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

          <div>
            <label htmlFor="confirmarSenha" className="mb-1 block text-sm font-medium text-neutral-700">
              Confirmar senha
            </label>
            <input
              id="confirmarSenha"
              type={mostrarSenha ? "text" : "password"}
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a senha"
              required
              minLength={8}
              className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-3 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <label className="flex items-start gap-3 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={termos}
              onChange={(e) => setTermos(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
            />
            <span>
              Li e aceito os{" "}
              <Link href="/termos-de-uso" className="text-brand-600 underline hover:text-brand-700">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link href="/politica-de-privacidade" className="text-brand-600 underline hover:text-brand-700">
                Política de Privacidade
              </Link>.
            </span>
          </label>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-full bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {carregando ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-brand-100"></div>
          <span className="text-xs text-neutral-400">ou</span>
          <div className="h-px flex-1 bg-brand-100"></div>
        </div>

        <button
          onClick={handleGoogleSignup}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-brand-200 bg-white py-3 text-sm font-medium text-neutral-700 transition hover:bg-brand-50/50"
        >
          <i className="fa-brands fa-google text-base text-red-500"></i>
          Cadastrar com Google
        </button>

        <p className="mt-8 text-center text-sm text-neutral-500">
          Já tem uma conta?{" "}
          <Link href="/perfil" className="font-medium text-brand-600 transition hover:text-brand-700">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
