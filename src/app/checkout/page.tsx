"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatarPreco } from "@/lib/utils";

export default function CheckoutPage() {
  const { itens, totalValor, limparCarrinho } = useCartStore();
  const [enviando, setEnviando] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function finalizarPedido(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const endereco = `${formData.get('endereco') || ''}`;
      const metodoPagamento = `${formData.get('pagamento') || 'pix'}`;

      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itens: itens.map((item) => ({
            produtoId: item.produtoId,
            slug: item.slug,
            nome: item.nome,
            imagem: item.imagem,
            preco: item.preco,
            tamanho: item.tamanho,
            quantidade: item.quantidade,
          })),
          enderecoEntrega: { completo: endereco },
          metodoPagamento,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao criar pedido.');
        setEnviando(false);
        return;
      }

      setPedidoConfirmado(true);
      limparCarrinho();
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    }

    setEnviando(false);
  }

  if (pedidoConfirmado) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-brand-700">Pedido recebido!</h1>
        <p className="mt-2 text-neutral-600">
          Em breve você receberá a confirmação de pagamento e o código de rastreio por e-mail.
        </p>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center text-neutral-500">
        Sua sacola está vazia. Adicione produtos antes de finalizar a compra.
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-2">
      <form onSubmit={finalizarPedido} className="space-y-4">
        <h1 className="mb-2 text-2xl font-semibold text-neutral-900">Finalizar compra</h1>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Nome completo</label>
          <input
            name="nome"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">E-mail</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Endereço de entrega</label>
          <input
            name="endereco"
            required
            placeholder="Rua, número, bairro, cidade - UF"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Forma de pagamento</label>
          <select name="pagamento" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
            <option value="pix">Pix</option>
            <option value="cartao">Cartão de crédito</option>
          </select>
        </div>

        {erro && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-full bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {enviando ? "Processando..." : "Confirmar pedido"}
        </button>
      </form>

      <div className="rounded-2xl border border-neutral-100 p-6">
        <h2 className="mb-4 font-semibold text-neutral-800">Resumo do pedido</h2>
        <ul className="space-y-2 text-sm">
          {itens.map((item) => (
            <li key={`${item.produtoId}-${item.tamanho}`} className="flex justify-between">
              <span>
                {item.nome} ({item.tamanho}) x{item.quantidade}
              </span>
              <span>{formatarPreco(item.preco * item.quantidade)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-neutral-100 pt-4 font-semibold">
          <span>Total</span>
          <span className="text-brand-700">{formatarPreco(totalValor())}</span>
        </div>
      </div>
    </div>
  );
}
