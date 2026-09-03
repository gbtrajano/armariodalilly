"use client";

import { useState } from "react";
import { OpcaoFrete } from "@/lib/types";
import { formatarPreco } from "@/lib/utils";

interface Props {
  pesoGramas: number;
  altura: number;
  largura: number;
  comprimento: number;
}

export default function CepCalculator({ pesoGramas, altura, largura, comprimento }: Props) {
  const [cep, setCep] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [opcoes, setOpcoes] = useState<OpcaoFrete[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function calcularFrete() {
    setErro(null);
    setOpcoes(null);

    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setErro("Informe um CEP válido com 8 dígitos.");
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cepDestino: cepLimpo,
          pesoGramas,
          altura,
          largura,
          comprimento
        })
      });

      if (!resposta.ok) throw new Error("Falha ao calcular o frete.");

      const dados = (await resposta.json()) as { opcoes: OpcaoFrete[] };
      setOpcoes(dados.opcoes);
    } catch {
      setErro("Não foi possível calcular o frete agora. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <label className="mb-2 block text-sm font-medium text-neutral-700">
        Calcular frete e prazo
      </label>
      <div className="flex gap-2">
        <input
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          placeholder="00000-000"
          maxLength={9}
          className="w-32 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          onClick={calcularFrete}
          disabled={carregando}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {carregando ? "Calculando..." : "Calcular"}
        </button>
      </div>

      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}

      {opcoes && (
        <ul className="mt-3 space-y-2">
          {opcoes.map((opcao) => (
            <li
              key={`${opcao.transportadora}-${opcao.servico}`}
              className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-sm"
            >
              <span>
                {opcao.transportadora} · {opcao.servico} — até {opcao.prazoDias} dias úteis
              </span>
              <span className="font-semibold text-brand-700">{formatarPreco(opcao.valor)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
