"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

interface Stats {
  totalProdutos: number;
  totalPedidos: number;
  totalUsuarios: number;
  pedidosPendentes: number;
}

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats>({
    totalProdutos: 0,
    totalPedidos: 0,
    totalUsuarios: 0,
    pedidosPendentes: 0,
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarStats() {
      const [produtos, pedidos, usuarios, pendentes] = await Promise.all([
        supabase.from("produtos").select("id", { count: "exact", head: true }),
        supabase.from("pedidos").select("id", { count: "exact", head: true }),
        supabase.from("usuarios").select("id", { count: "exact", head: true }),
        supabase.from("pedidos").select("id", { count: "exact", head: true }).eq("status", "pendente"),
      ]);

      setStats({
        totalProdutos: produtos.count || 0,
        totalPedidos: pedidos.count || 0,
        totalUsuarios: usuarios.count || 0,
        pedidosPendentes: pendentes.count || 0,
      });
      setCarregando(false);
    }

    carregarStats();
  }, [supabase]);

  const cards = [
    { label: "Produtos", value: stats.totalProdutos, icon: "fa-shirt", href: "/admin/produtos", cor: "bg-blue-50 text-blue-600" },
    { label: "Pedidos", value: stats.totalPedidos, icon: "fa-box", href: "/admin/pedidos", cor: "bg-green-50 text-green-600" },
    { label: "Pendentes", value: stats.pedidosPendentes, icon: "fa-clock", href: "/admin/pedidos", cor: "bg-yellow-50 text-yellow-600" },
    { label: "Usuários", value: stats.totalUsuarios, icon: "fa-users", href: "/admin/usuarios", cor: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-neutral-900">Dashboard</h1>

      {carregando ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-brand-50"></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-2xl border border-brand-100 bg-white p-6 transition hover:shadow-md"
            >
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.cor}`}>
                <i className={`fa-solid ${card.icon}`}></i>
              </div>
              <p className="text-2xl font-semibold text-neutral-900">{card.value}</p>
              <p className="text-sm text-neutral-500">{card.label}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-neutral-800">Ações rápidas</h2>
          <div className="space-y-3">
            <Link
              href="/admin/produtos/novo"
              className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
            >
              <i className="fa-solid fa-plus"></i>
              Adicionar novo produto
            </Link>
            <Link
              href="/admin/promocoes/nova"
              className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
            >
              <i className="fa-solid fa-tags"></i>
              Criar promoção da semana
            </Link>
            <Link
              href="/admin/pedidos"
              className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
            >
              <i className="fa-solid fa-box"></i>
              Ver pedidos pendentes
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-neutral-800">Dicas</h2>
          <ul className="space-y-3 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check mt-0.5 text-green-500"></i>
              Execute o schema SQL no Supabase para criar as tabelas
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check mt-0.5 text-green-500"></i>
              Crie seu usuário admin no Supabase e execute <code className="rounded bg-brand-50 px-1">SELECT tornar_admin(&apos;seu@email.com&apos;)</code>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check mt-0.5 text-green-500"></i>
              Adicione suas variáveis de ambiente (.env.local)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
