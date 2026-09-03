"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatarPreco } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import type { Endereco } from "@/lib/types";

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export default function CheckoutPage() {
  const { itens, totalValor, limparCarrinho } = useCartStore();
  const [enviando, setEnviando] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Saved addresses
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<string>("novo");
  const [usandoSalvo, setUsandoSalvo] = useState(false);

  // Form fields
  const [cep, setCep] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");

  // Coupon
  const [codigoCupom, setCodigoCupom] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState<{ codigo: string; desconto: number; descricao: string | null } | null>(null);
  const [cupomErro, setCupomErro] = useState("");
  const [validandoCupom, setValidandoCupom] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function carregarEnderecos() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/enderecos");
      if (res.ok) {
        const data = await res.json();
        setEnderecos(data);
        // Auto-select default address
        const padrao = data.find((e: Endereco) => e.padrao);
        if (padrao) {
          setEnderecoSelecionado(padrao.id);
          setUsandoSalvo(true);
        }
      }
    }
    carregarEnderecos();
  }, [supabase]);

  function selecionarEndereco(id: string) {
    setEnderecoSelecionado(id);
    if (id === "novo") {
      setUsandoSalvo(false);
    } else {
      setUsandoSalvo(true);
      const end = enderecos.find((e) => e.id === id);
      if (end) {
        setCep(end.cep);
        setEstado(end.estado);
        setCidade(end.cidade);
        setBairro(end.bairro);
        setRua(end.rua);
        setNumero(end.numero);
        setComplemento(end.complemento || "");
      }
    }
  }

  async function validarCupom() {
    if (!codigoCupom.trim()) return;
    setValidandoCupom(true);
    setCupomErro("");

    const res = await fetch("/api/cupons/validar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: codigoCupom.trim(), subtotal: totalValor() }),
    });

    const data = await res.json();

    if (!res.ok) {
      setCupomErro(data.error);
      setCupomAplicado(null);
    } else {
      setCupomAplicado(data);
      setCupomErro("");
    }
    setValidandoCupom(false);
  }

  function removerCupom() {
    setCupomAplicado(null);
    setCodigoCupom("");
    setCupomErro("");
  }

  const subtotal = totalValor();
  const desconto = cupomAplicado?.desconto || 0;
  const totalComDesconto = Math.max(subtotal - desconto, 0);

  async function finalizarPedido(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);

    try {
      const enderecoEntrega = {
        cep,
        estado,
        cidade,
        bairro,
        rua,
        numero,
        complemento: complemento || null,
      };

      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          enderecoEntrega,
          metodoPagamento: "pix",
          cupomCodigo: cupomAplicado?.codigo || null,
          desconto: desconto || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao criar pedido.");
        setEnviando(false);
        return;
      }

      setPedidoConfirmado(true);
      limparCarrinho();
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    }

    setEnviando(false);
  }

  if (pedidoConfirmado) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <i className="fa-solid fa-check text-2xl text-green-600"></i>
        </div>
        <h1 className="text-2xl font-semibold text-brand-700">Pedido recebido!</h1>
        <p className="mt-2 text-neutral-600">
          Em breve você receberá a confirmação de pagamento e o código de rastreio por e-mail.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Voltar para a loja
        </Link>
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
      <form onSubmit={finalizarPedido} className="space-y-5">
        <h1 className="mb-2 text-2xl font-semibold text-neutral-900">Finalizar compra</h1>

        {/* Saved addresses selector */}
        {enderecos.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Endereço de entrega
            </label>
            <div className="space-y-2">
              {enderecos.map((end) => (
                <label
                  key={end.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    enderecoSelecionado === end.id
                      ? "border-brand-400 bg-brand-50/50"
                      : "border-neutral-200 hover:border-brand-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="endereco_radio"
                    checked={enderecoSelecionado === end.id}
                    onChange={() => selecionarEndereco(end.id)}
                    className="mt-0.5 h-4 w-4 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-800">{end.label}</span>
                      {end.padrao && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">
                      {end.rua}, {end.numero}{end.complemento ? ` - ${end.complemento}` : ""}, {end.bairro}, {end.cidade} - {end.estado}, CEP: {end.cep}
                    </p>
                  </div>
                </label>
              ))}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                  enderecoSelecionado === "novo"
                    ? "border-brand-400 bg-brand-50/50"
                    : "border-neutral-200 hover:border-brand-200"
                }`}
              >
                <input
                  type="radio"
                  name="endereco_radio"
                  checked={enderecoSelecionado === "novo"}
                  onChange={() => selecionarEndereco("novo")}
                  className="mt-0.5 h-4 w-4 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-neutral-600">
                  <i className="fa-solid fa-plus mr-1 text-xs"></i> Usar outro endereço
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Address form fields */}
        <div className={`space-y-3 ${enderecos.length > 0 && usandoSalvo ? "hidden" : ""}`}>
          {enderecos.length === 0 && (
            <p className="text-sm font-medium text-neutral-700">Endereço de entrega</p>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="mb-1 block text-xs font-medium text-neutral-700">CEP *</label>
              <input
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="00000-000"
                required
                maxLength={9}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-neutral-700">Estado *</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="">UF</option>
                {ESTADOS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">Cidade *</label>
            <input
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="São Paulo"
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">Bairro *</label>
            <input
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Centro"
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-neutral-700">Rua *</label>
              <input
                value={rua}
                onChange={(e) => setRua(e.target.value)}
                placeholder="Rua das Flores"
                required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="col-span-1">
              <label className="mb-1 block text-xs font-medium text-neutral-700">Número *</label>
              <input
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="123"
                required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">Complemento</label>
            <input
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
              placeholder="Apto 101, Bloco B"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Payment */}
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

        {/* Coupon */}
        <div className="mt-4 border-t border-neutral-100 pt-4">
          {cupomAplicado ? (
            <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
              <div>
                <span className="text-xs font-semibold text-green-700">
                  <i className="fa-solid fa-ticket mr-1"></i>{cupomAplicado.codigo}
                </span>
                <p className="text-xs text-green-600">-{formatarPreco(desconto)}</p>
              </div>
              <button
                onClick={removerCupom}
                className="text-xs text-green-700 underline hover:text-green-900"
              >
                Remover
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  value={codigoCupom}
                  onChange={(e) => setCodigoCupom(e.target.value.toUpperCase())}
                  placeholder="Código do cupom"
                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm uppercase outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={validarCupom}
                  disabled={validandoCupom || !codigoCupom.trim()}
                  className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-900 disabled:opacity-50"
                >
                  {validandoCupom ? "..." : "Aplicar"}
                </button>
              </div>
              {cupomErro && (
                <p className="mt-1 text-xs text-red-500">{cupomErro}</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1 border-t border-neutral-100 pt-3 text-sm">
          <div className="flex justify-between text-neutral-500">
            <span>Subtotal</span>
            <span>{formatarPreco(subtotal)}</span>
          </div>
          {desconto > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Desconto</span>
              <span>-{formatarPreco(desconto)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 font-semibold">
            <span>Total</span>
            <span className="text-brand-700">{formatarPreco(totalComDesconto)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
