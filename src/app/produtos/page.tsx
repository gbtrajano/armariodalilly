"use client";

import { useState, useEffect, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/lib/supabase";
import { Produto, Tamanho } from "@/lib/types";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function carregar() {
      const { data } = await supabase
        .from("produtos")
        .select("*, produto_tamanhos(tamanho, estoque)")
        .eq("ativo", true)
        .order("criado_em", { ascending: false });

      if (data) {
        const mapeados: Produto[] = data.map((p) => ({
          id: p.id,
          slug: p.slug,
          nome: p.nome,
          descricao: p.descricao ?? "",
          preco: p.preco,
          precoPromocional: p.preco_promocional ?? undefined,
          imagem: p.imagem_principal ?? "",
          categoria: p.categoria,
          tamanhosDisponiveis: (p.produto_tamanhos ?? [])
            .filter((t: { estoque: number }) => t.estoque > 0)
            .map((t: { tamanho: Tamanho }) => t.tamanho),
          pesoGramas: p.peso_gramas ?? 350,
          altura: p.altura ?? 4,
          largura: p.largura ?? 25,
          comprimento: p.comprimento ?? 32,
        }));
        setProdutos(mapeados);
      }
      setCarregando(false);
    }

    carregar();
  }, []);

  const categorias = useMemo(
    () => [...new Set(produtos.map((p) => p.categoria))],
    [produtos]
  );

  const produtosFiltrados = useMemo(() => {
    if (!filtroCategoria) return produtos;
    return produtos.filter((p) => p.categoria === filtroCategoria);
  }, [filtroCategoria, produtos]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold text-neutral-900">Todos os produtos</h1>

      {/* Filtro de Categoria */}
      {!carregando && categorias.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroCategoria(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              !filtroCategoria
                ? "bg-brand-600 text-white"
                : "border border-brand-200 bg-white text-neutral-600 hover:bg-brand-50"
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(filtroCategoria === cat ? null : cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filtroCategoria === cat
                  ? "bg-brand-600 text-white"
                  : "border border-brand-200 bg-white text-neutral-600 hover:bg-brand-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Estados */}
      {carregando ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-brand-50" />
          ))}
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="py-16 text-center">
          <i className="fa-solid fa-bag-shopping mb-4 text-3xl text-neutral-300"></i>
          <p className="text-neutral-500">
            {filtroCategoria
              ? "Nenhum produto encontrado nessa categoria."
              : "Nenhum produto disponível no momento."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-neutral-500">
            {produtosFiltrados.length}{" "}
            {produtosFiltrados.length === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {produtosFiltrados.map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
