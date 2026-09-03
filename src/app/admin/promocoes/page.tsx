"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

interface Promocao {
  id: string;
  titulo: string;
  descricao: string | null;
  desconto_percentual: number | null;
  data_inicio: string;
  data_fim: string;
  ativa: boolean;
  criado_em: string;
}

export default function AdminPromocoesPage() {
  const supabase = createClient();
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarPromocoes();
  }, []);

  async function carregarPromocoes() {
    const { data } = await supabase
      .from("promocoes_semana")
      .select("*")
      .order("criado_em", { ascending: false });

    setPromocoes(data || []);
    setCarregando(false);
  }

  async function toggleAtiva(id: string, ativa: boolean) {
    await supabase.from("promocoes_semana").update({ ativa: !ativa }).eq("id", id);
    carregarPromocoes();
  }

  async function excluirPromocao(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta promoção?")) return;
    await supabase.from("promocoes_semana").delete().eq("id", id);
    carregarPromocoes();
  }

  const formatarData = (data: string) =>
    new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Promoções da Semana</h1>
        <Link
          href="/admin/promocoes/nova"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          Nova promoção
        </Link>
      </div>

      {carregando ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-brand-50"></div>
          ))}
        </div>
      ) : promocoes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 py-16 text-center">
          <i className="fa-solid fa-tags mb-4 text-3xl text-neutral-300"></i>
          <p className="text-neutral-500">Nenhuma promoção criada ainda.</p>
          <Link
            href="/admin/promocoes/nova"
            className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Criar primeira promoção →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {promocoes.map((promo) => (
            <div
              key={promo.id}
              className="rounded-2xl border border-brand-100 bg-white p-5 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral-800">{promo.titulo}</h3>
                    {!promo.ativa && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                        Inativa
                      </span>
                    )}
                    {promo.desconto_percentual && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                        -{promo.desconto_percentual}%
                      </span>
                    )}
                  </div>
                  {promo.descricao && (
                    <p className="mt-1 text-sm text-neutral-500">{promo.descricao}</p>
                  )}
                  <p className="mt-2 text-xs text-neutral-400">
                    <i className="fa-regular fa-calendar mr-1"></i>
                    {formatarData(promo.data_inicio)} até {formatarData(promo.data_fim)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAtiva(promo.id, promo.ativa)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      promo.ativa
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                    }`}
                  >
                    {promo.ativa ? "Ativa" : "Inativa"}
                  </button>
                  <Link
                    href={`/admin/promocoes/${promo.id}`}
                    className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => excluirPromocao(promo.id)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
