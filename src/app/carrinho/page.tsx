"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatarPreco } from "@/lib/utils";

export default function CarrinhoPage() {
  const { itens, removerItem, atualizarQuantidade, totalValor } = useCartStore();

  if (itens.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-xl font-semibold text-neutral-800">Sua sacola está vazia</h1>
        <Link
          href="/produtos"
          className="mt-4 inline-block rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Continuar comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900">Sua sacola</h1>

      <div className="space-y-4">
        {itens.map((item) => (
          <div
            key={`${item.produtoId}-${item.tamanho}`}
            className="flex items-center gap-4 rounded-xl border border-neutral-100 p-4"
          >
            <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-brand-50">
              <Image src={item.imagem} alt={item.nome} fill className="object-cover" />
            </div>

            <div className="flex-1">
              <p className="font-medium text-neutral-800">{item.nome}</p>
              <p className="text-sm text-neutral-500">Tamanho: {item.tamanho}</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() =>
                    atualizarQuantidade(item.produtoId, item.tamanho, item.quantidade - 1)
                  }
                  className="h-7 w-7 rounded-full border border-neutral-300"
                >
                  -
                </button>
                <span>{item.quantidade}</span>
                <button
                  onClick={() =>
                    atualizarQuantidade(item.produtoId, item.tamanho, item.quantidade + 1)
                  }
                  className="h-7 w-7 rounded-full border border-neutral-300"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-brand-700">
                {formatarPreco(item.preco * item.quantidade)}
              </p>
              <button
                onClick={() => removerItem(item.produtoId, item.tamanho)}
                className="mt-2 text-xs text-neutral-400 hover:text-red-500"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-6">
        <span className="text-lg font-semibold">Subtotal</span>
        <span className="text-lg font-semibold text-brand-700">{formatarPreco(totalValor())}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block w-full rounded-full bg-brand-600 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700"
      >
        Ir para o pagamento
      </Link>
    </div>
  );
}
