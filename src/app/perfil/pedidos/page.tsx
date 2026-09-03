"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatarPreco } from "@/lib/utils";

interface PedidoItem {
  id: string;
  tamanho: string;
  quantidade: number;
  preco_unitario: number;
  produto_id: string;
  produtos: { nome: string; imagem_principal: string | null }[] | null;
}

interface Pedido {
  id: string;
  status: string;
  valor_subtotal: number;
  valor_frete: number;
  valor_total: number;
  endereco_entrega: Record<string, string> | string | null;
  metodo_pagamento: string | null;
  criado_em: string;
  itens: PedidoItem[];
}

const statusLabels: Record<string, { label: string; cor: string; icon: string }> = {
  pendente: { label: "Pendente", cor: "bg-yellow-50 text-yellow-700", icon: "fa-clock" },
  pago: { label: "Pago", cor: "bg-blue-50 text-blue-700", icon: "fa-credit-card" },
  enviado: { label: "Enviado", cor: "bg-purple-50 text-purple-700", icon: "fa-truck" },
  entregue: { label: "Entregue", cor: "bg-green-50 text-green-700", icon: "fa-check-circle" },
  cancelado: { label: "Cancelado", cor: "bg-red-50 text-red-700", icon: "fa-xmark-circle" },
};

export default function MeusPedidosPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      const res = await fetch("/api/pedidos/mine");
      if (res.status === 401) {
        router.replace("/perfil");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPedidos(data);
      }
      setCarregando(false);
    }
    carregar();
  }, [router]);

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatarEndereco(end: Record<string, string> | string | null) {
    if (!end) return "—";
    if (typeof end === "string") return end;
    return [end.rua, end.numero, end.complemento, end.bairro, end.cidade, end.estado ? `- ${end.estado}` : "", end.cep ? `CEP: ${end.cep}` : ""].filter(Boolean).join(", ");
  }

  function formatarPagamento(metodo: string | null) {
    if (!metodo) return "—";
    if (metodo === "pix") return "Pix";
    if (metodo === "cartao") return "Cartão de crédito";
    return metodo;
  }

  if (carregando) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-brand-50"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="mb-8 text-2xl font-serif font-semibold text-neutral-900">Meus pedidos</h1>

      {pedidos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 py-16 text-center">
          <i className="fa-solid fa-bag-shopping mb-4 text-3xl text-neutral-300"></i>
          <p className="text-neutral-500">Você ainda não fez nenhum pedido.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="rounded-2xl border border-brand-100 bg-white transition hover:shadow-md"
            >
              {/* Header */}
              <button
                onClick={() => setExpandido(expandido === pedido.id ? null : pedido.id)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusLabels[pedido.status]?.cor}`}>
                      <i className={`fa-solid ${statusLabels[pedido.status]?.icon} mr-1`}></i>
                      {statusLabels[pedido.status]?.label}
                    </span>
                    <span className="text-sm font-semibold text-neutral-800">
                      {formatarPreco(pedido.valor_total)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">{formatarData(pedido.criado_em)}</p>
                </div>
                <i className={`fa-solid fa-chevron-down text-xs text-neutral-400 transition-transform ${expandido === pedido.id ? "rotate-180" : ""}`}></i>
              </button>

              {/* Expanded details */}
              {expandido === pedido.id && (
                <div className="border-t border-brand-50 px-4 pb-4 pt-3">
                  {/* Items */}
                  <div className="space-y-2">
                    {pedido.itens.map((item) => {
                      const produto = item.produtos?.[0];
                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-brand-50">
                            {produto?.imagem_principal ? (
                              <img
                                src={produto.imagem_principal}
                                alt={produto.nome}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <i className="fa-solid fa-image text-neutral-300"></i>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-800">{produto?.nome || "Produto"}</p>
                            <p className="text-xs text-neutral-500">
                              Tam: {item.tamanho} · Qtd: {item.quantidade} · {formatarPreco(item.preco_unitario)}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-neutral-700">
                            {formatarPreco(item.preco_unitario * item.quantidade)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totals */}
                  <div className="mt-3 space-y-1 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatarPreco(pedido.valor_subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frete</span>
                      <span>{pedido.valor_frete > 0 ? formatarPreco(pedido.valor_frete) : "Grátis"}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-neutral-800">
                      <span>Total</span>
                      <span>{formatarPreco(pedido.valor_total)}</span>
                    </div>
                  </div>

                  {/* Address & payment */}
                  <div className="mt-3 space-y-2 border-t border-neutral-100 pt-3 text-xs">
                    <div className="flex items-start gap-2 text-neutral-600">
                      <i className="fa-solid fa-location-dot mt-0.5 text-neutral-400"></i>
                      <span>{formatarEndereco(pedido.endereco_entrega)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <i className="fa-solid fa-wallet text-neutral-400"></i>
                      <span>{formatarPagamento(pedido.metodo_pagamento)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-neutral-500">
        <Link href="/perfil/conta" className="text-brand-600 transition hover:text-brand-700">
          ← Voltar para minha conta
        </Link>
      </p>
    </div>
  );
}
