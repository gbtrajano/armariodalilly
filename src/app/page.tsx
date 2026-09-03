import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { Produto, Tamanho } from "@/lib/types";

async function getProdutos(): Promise<Produto[]> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("produtos")
    .select("*, produto_tamanhos(tamanho, estoque)")
    .eq("ativo", true)
    .order("criado_em", { ascending: false });

  if (!data) return [];

  return data.map((p) => ({
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
}

export default async function HomePage() {
  const produtos = await getProdutos();

  const promocoes = produtos.filter((p) => !!p.precoPromocional);
  const categorias = [...new Set(produtos.map((p) => p.categoria))];

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="mb-2 text-sm uppercase tracking-widest text-brand-500">
          Nova coleção
        </p>
        <h1 className="mx-auto max-w-2xl font-serif text-4xl font-semibold text-neutral-900 md:text-5xl">
          Moda feminina que combina com o seu estilo
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-neutral-500">
          Peças selecionadas, tecidos confortáveis e caimento pensado para o seu dia a dia.
        </p>
        <Link
          href="/produtos"
          className="mt-8 inline-block rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Ver todos os produtos
        </Link>
      </section>

      {/* Promoções da Semana */}
      {promocoes.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-800">
              <i className="fa-solid fa-tags mr-2 text-brand-500"></i>
              Promoções da Semana
            </h2>
            <Link
              href="/produtos"
              className="text-sm font-medium text-brand-600 transition hover:text-brand-700"
            >
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {promocoes.map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))}
          </div>
        </section>
      )}

      {/* Categorias */}
      {categorias.map((cat) => {
        const produtosDaCategoria = produtos.filter((p) => p.categoria === cat);
        return (
          <section key={cat} className="mx-auto max-w-6xl px-4 pb-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-800">{cat}</h2>
              <Link
                href={`/produtos?categoria=${cat}`}
                className="text-sm font-medium text-brand-600 transition hover:text-brand-700"
              >
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {produtosDaCategoria.map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Estado vazio */}
      {produtos.length === 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20 text-center">
          <div className="rounded-2xl border border-dashed border-brand-200 py-20">
            <i className="fa-solid fa-shirt mb-4 text-4xl text-neutral-200"></i>
            <p className="text-neutral-400">Nenhum produto disponível no momento.</p>
          </div>
        </section>
      )}

      {/* CTA Final */}
      {produtos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20 text-center">
          <div className="rounded-2xl bg-brand-50 px-6 py-12">
            <h2 className="text-2xl font-serif font-semibold text-neutral-900">
              Explorar toda a coleção
            </h2>
            <p className="mx-auto mt-2 max-w-md text-neutral-500">
              Encontre a peça perfeita para o seu estilo. Novidades toda semana.
            </p>
            <Link
              href="/produtos"
              className="mt-6 inline-block rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Ver todos os produtos
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
