import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { Produto, Tamanho } from "@/lib/types";
import ProductDetailClient from "./ProductDetailClient";

async function getProdutoPorSlug(slug: string): Promise<Produto | null> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("produtos")
    .select("*, produto_tamanhos(tamanho, estoque)")
    .eq("slug", slug)
    .eq("ativo", true)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    nome: data.nome,
    descricao: data.descricao ?? "",
    preco: data.preco,
    precoPromocional: data.preco_promocional ?? undefined,
    imagem: data.imagem_principal ?? "",
    categoria: data.categoria,
    tamanhosDisponiveis: (data.produto_tamanhos ?? [])
      .filter((t: { estoque: number }) => t.estoque > 0)
      .map((t: { tamanho: Tamanho }) => t.tamanho),
    pesoGramas: data.peso_gramas ?? 350,
    altura: data.altura ?? 4,
    largura: data.largura ?? 25,
    comprimento: data.comprimento ?? 32,
  };
}

export default async function ProdutoDetalhePage({
  params,
}: {
  params: { slug: string };
}) {
  const produto = await getProdutoPorSlug(params.slug);

  if (!produto) notFound();

  return <ProductDetailClient produto={produto} />;
}
