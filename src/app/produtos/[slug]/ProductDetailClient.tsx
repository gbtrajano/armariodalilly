"use client";

import { useState } from "react";
import Image from "next/image";
import { Produto, Tamanho } from "@/lib/types";
import { formatarPreco, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import SizeGuideModal from "@/components/SizeGuideModal";
import CepCalculator from "@/components/CepCalculator";

export default function ProductDetailClient({ produto }: { produto: Produto }) {
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<Tamanho | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [erroTamanho, setErroTamanho] = useState(false);
  const adicionarItem = useCartStore((s) => s.adicionarItem);

  const precoFinal = produto.precoPromocional ?? produto.preco;

  function handleAdicionar() {
    if (!tamanhoSelecionado) {
      setErroTamanho(true);
      return;
    }

    adicionarItem({
      produtoId: produto.id,
      slug: produto.slug,
      nome: produto.nome,
      imagem: produto.imagem,
      preco: precoFinal,
      tamanho: tamanhoSelecionado,
      quantidade
    });
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-brand-50">
        <Image src={produto.imagem} alt={produto.nome} fill className="object-cover" priority />
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-400">{produto.categoria}</p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{produto.nome}</h1>

        <div className="mt-3 flex items-baseline gap-2">
          {produto.precoPromocional && (
            <span className="text-neutral-400 line-through">{formatarPreco(produto.preco)}</span>
          )}
          <span className="text-2xl font-semibold text-brand-700">
            {formatarPreco(precoFinal)}
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-neutral-600">{produto.descricao}</p>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">Tamanho</span>
            <SizeGuideModal tamanhosDisponiveis={produto.tamanhosDisponiveis} />
          </div>
          <div className="flex gap-2">
            {produto.tamanhosDisponiveis.map((tamanho) => (
              <button
                key={tamanho}
                onClick={() => {
                  setTamanhoSelecionado(tamanho);
                  setErroTamanho(false);
                }}
                className={cn(
                  "h-10 w-10 rounded-full border text-sm font-medium",
                  tamanhoSelecionado === tamanho
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-neutral-300 text-neutral-700 hover:border-brand-400"
                )}
              >
                {tamanho}
              </button>
            ))}
          </div>
          {erroTamanho && (
            <p className="mt-1 text-xs text-red-600">Selecione um tamanho para continuar.</p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-700">Quantidade</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              className="h-8 w-8 rounded-full border border-neutral-300"
            >
              -
            </button>
            <span>{quantidade}</span>
            <button
              onClick={() => setQuantidade((q) => q + 1)}
              className="h-8 w-8 rounded-full border border-neutral-300"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleAdicionar}
          className="mt-6 w-full rounded-full bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Adicionar à sacola
        </button>

        <div className="mt-8">
          <CepCalculator
            pesoGramas={produto.pesoGramas}
            altura={produto.altura}
            largura={produto.largura}
            comprimento={produto.comprimento}
          />
        </div>
      </div>
    </div>
  );
}
