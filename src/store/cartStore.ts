"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ItemCarrinho } from "@/lib/types";

interface CartState {
  itens: ItemCarrinho[];
  aberto: boolean;
  adicionarItem: (item: ItemCarrinho) => void;
  removerItem: (produtoId: string, tamanho: string) => void;
  atualizarQuantidade: (produtoId: string, tamanho: string, quantidade: number) => void;
  limparCarrinho: () => void;
  abrirCarrinho: () => void;
  fecharCarrinho: () => void;
  totalItens: () => number;
  totalValor: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      itens: [],
      aberto: false,

      adicionarItem: (novoItem) => {
        set((state) => {
          const existente = state.itens.find(
            (i) => i.produtoId === novoItem.produtoId && i.tamanho === novoItem.tamanho
          );

          if (existente) {
            return {
              itens: state.itens.map((i) =>
                i === existente ? { ...i, quantidade: i.quantidade + novoItem.quantidade } : i
              ),
              aberto: true
            };
          }

          return { itens: [...state.itens, novoItem], aberto: true };
        });
      },

      removerItem: (produtoId, tamanho) => {
        set((state) => ({
          itens: state.itens.filter((i) => !(i.produtoId === produtoId && i.tamanho === tamanho))
        }));
      },

      atualizarQuantidade: (produtoId, tamanho, quantidade) => {
        set((state) => {
          if (quantidade <= 0) {
            return {
              itens: state.itens.filter(
                (i) => !(i.produtoId === produtoId && i.tamanho === tamanho)
              )
            };
          }
          return {
            itens: state.itens.map((i) =>
              i.produtoId === produtoId && i.tamanho === tamanho
                ? { ...i, quantidade }
                : i
            )
          };
        });
      },

      limparCarrinho: () => set({ itens: [] }),
      abrirCarrinho: () => set({ aberto: true }),
      fecharCarrinho: () => set({ aberto: false }),

      totalItens: () => get().itens.reduce((soma, i) => soma + i.quantidade, 0),
      totalValor: () => get().itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0)
    }),
    {
      name: "carrinho-moda-feminina" // chave no localStorage
    }
  )
);
