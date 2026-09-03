"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatarPreco } from "@/lib/utils";

export default function CartDrawer() {
  const { itens, aberto, fecharCarrinho, removerItem, atualizarQuantidade, totalValor } =
    useCartStore();

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={fecharCarrinho}>
      <div
        className="flex h-full w-full max-w-md flex-col bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-700">Sua sacola</h2>
          <button onClick={fecharCarrinho} className="text-neutral-400 hover:text-neutral-700">
            ✕
          </button>
        </div>

        {itens.length === 0 ? (
          <p className="text-sm text-neutral-500">Sua sacola está vazia por enquanto.</p>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto">
            {itens.map((item) => (
              <div key={`${item.produtoId}-${item.tamanho}`} className="flex gap-3">
                <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-brand-50">
                  <Image src={item.imagem} alt={item.nome} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-800">{item.nome}</p>
                  <p className="text-xs text-neutral-500">Tamanho: {item.tamanho}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() =>
                        atualizarQuantidade(item.produtoId, item.tamanho, item.quantidade - 1)
                      }
                      className="h-6 w-6 rounded-full border border-neutral-300 text-sm"
                    >
                      -
                    </button>
                    <span className="text-sm">{item.quantidade}</span>
                    <button
                      onClick={() =>
                        atualizarQuantidade(item.produtoId, item.tamanho, item.quantidade + 1)
                      }
                      className="h-6 w-6 rounded-full border border-neutral-300 text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <span className="text-sm font-semibold text-brand-700">
                    {formatarPreco(item.preco * item.quantidade)}
                  </span>
                  <button
                    onClick={() => removerItem(item.produtoId, item.tamanho)}
                    className="text-xs text-neutral-400 hover:text-red-500"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-neutral-100 pt-4">
          <div className="mb-4 flex justify-between text-sm font-medium">
            <span>Subtotal</span>
            <span>{formatarPreco(totalValor())}</span>
          </div>
          <Link
            href="/checkout"
            onClick={fecharCarrinho}
            className="block w-full rounded-full bg-brand-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Finalizar compra
          </Link>
        </div>
      </div>
    </div>
  );
}
