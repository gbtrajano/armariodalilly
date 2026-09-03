"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Pedido {
  id: string;
  status: string;
  valor_total: number;
  criado_em: string;
  usuarios: { nome: string; email: string }[] | null;
}

const statusLabels: Record<string, { label: string; cor: string }> = {
  pendente: { label: "Pendente", cor: "bg-yellow-50 text-yellow-700" },
  pago: { label: "Pago", cor: "bg-blue-50 text-blue-700" },
  enviado: { label: "Enviado", cor: "bg-purple-50 text-purple-700" },
  entregue: { label: "Entregue", cor: "bg-green-50 text-green-700" },
  cancelado: { label: "Cancelado", cor: "bg-red-50 text-red-700" },
};

export default function AdminPedidosPage() {
  const supabase = createClient();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);

  useEffect(() => {
    carregarPedidos();
  }, []);

  async function carregarPedidos() {
    let query = supabase
      .from("pedidos")
      .select("id, status, valor_total, criado_em, usuarios(nome, email)")
      .order("criado_em", { ascending: false });

    if (filtroStatus) {
      query = query.eq("status", filtroStatus);
    }

    const { data } = await query;
    setPedidos(data || []);
    setCarregando(false);
  }

  async function atualizarStatus(id: string, status: string) {
    await supabase.from("pedidos").update({ status, atualizado_em: new Date().toISOString() }).eq("id", id);
    carregarPedidos();
  }

  const formatarData = (data: string) =>
    new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-neutral-900">Pedidos</h1>

      {/* Filtro de status */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => { setFiltroStatus(null); setCarregando(true); }}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            !filtroStatus ? "bg-brand-600 text-white" : "border border-brand-200 bg-white text-neutral-600 hover:bg-brand-50"
          }`}
        >
          Todos
        </button>
        {Object.entries(statusLabels).map(([key, val]) => (
          <button
            key={key}
            onClick={() => { setFiltroStatus(key); setCarregando(true); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filtroStatus === key ? "bg-brand-600 text-white" : "border border-brand-200 bg-white text-neutral-600 hover:bg-brand-50"
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-brand-50"></div>
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 py-16 text-center">
          <i className="fa-solid fa-box mb-4 text-3xl text-neutral-300"></i>
          <p className="text-neutral-500">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="rounded-2xl border border-brand-100 bg-white p-4 transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusLabels[pedido.status]?.cor}`}>
                      {statusLabels[pedido.status]?.label}
                    </span>
                    <span className="text-sm font-semibold text-neutral-800">
                      R$ {pedido.valor_total.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    {pedido.usuarios?.[0]?.nome || "Usuário"} — {pedido.usuarios?.[0]?.email}
                  </p>
                  <p className="text-xs text-neutral-400">{formatarData(pedido.criado_em)}</p>
                </div>

                <select
                  value={pedido.status}
                  onChange={(e) => atualizarStatus(pedido.id, e.target.value)}
                  className="rounded-xl border border-brand-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  {Object.entries(statusLabels).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
