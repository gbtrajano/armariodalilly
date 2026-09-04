"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

interface ProdutoAdmin {
  id: string;
  slug: string;
  nome: string;
  preco: number;
  preco_promocional: number | null;
  categoria: string;
  ativo: boolean;
  imagem_principal: string | null;
  produto_tamanhos: { estoque: number }[];
}

export default function AdminProdutosPage() {
  const supabase = createClient();
  const [produtos, setProdutos] = useState<ProdutoAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    const { data } = await supabase
      .from("produtos")
      .select("*, produto_tamanhos(estoque)")
      .order("criado_em", { ascending: false });

    setProdutos(data || []);
    setCarregando(false);
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    const res = await fetch("/api/admin/produtos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ativo: !ativo }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erro ao atualizar produto.");
      return;
    }
    carregarProdutos();
  }

  async function excluirProduto(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    const res = await fetch(`/api/admin/produtos?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erro ao excluir produto.");
      return;
    }
    carregarProdutos();
  }

  const estoqueTotal = (tamanhos: { estoque: number }[]) =>
    tamanhos?.reduce((acc, t) => acc + t.estoque, 0) ?? 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          Novo produto
        </Link>
      </div>

      {carregando ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-brand-50"></div>
          ))}
        </div>
      ) : produtos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 py-16 text-center">
          <i className="fa-solid fa-shirt mb-4 text-3xl text-neutral-300"></i>
          <p className="text-neutral-500">Nenhum produto cadastrado ainda.</p>
          <Link
            href="/admin/produtos/novo"
            className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Adicionar primeiro produto →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-4 transition hover:shadow-md"
            >
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-brand-50">
                {produto.imagem_principal ? (
                  <Image
                    src={produto.imagem_principal}
                    alt={produto.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-300">
                    <i className="fa-solid fa-image text-xl"></i>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-medium text-neutral-800">{produto.nome}</h3>
                  {!produto.ativo && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                      Inativo
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-500">{produto.categoria}</p>
              </div>

              <div className="hidden text-right sm:block">
                {produto.preco_promocional ? (
                  <div>
                    <span className="text-sm text-neutral-400 line-through">
                      R$ {produto.preco.toFixed(2)}
                    </span>
                    <span className="ml-1 text-sm font-semibold text-brand-700">
                      R$ {produto.preco_promocional.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-neutral-800">
                    R$ {produto.preco.toFixed(2)}
                  </p>
                )}
                <p className="text-xs text-neutral-400">
                  Estoque: {estoqueTotal(produto.produto_tamanhos)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAtivo(produto.id, produto.ativo)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    produto.ativo
                      ? "bg-green-50 text-green-600 hover:bg-green-100"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  }`}
                >
                  {produto.ativo ? "Ativo" : "Inativo"}
                </button>
                <Link
                  href={`/admin/produtos/${produto.id}`}
                  className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
                >
                  Editar
                </Link>
                <button
                  onClick={() => excluirProduto(produto.id)}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
