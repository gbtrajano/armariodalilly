"use client";

import { useState } from "react";
import { Tamanho } from "@/lib/types";
import { tabelaMedidas } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function SizeGuideModal({
  tamanhosDisponiveis
}: {
  tamanhosDisponiveis: Tamanho[];
}) {
  const [aberto, setAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<Tamanho>(tamanhosDisponiveis[0]);

  const medidaAtiva = tabelaMedidas.find((m) => m.tamanho === abaAtiva);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-sm font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700"
      >
        Ver tabela de medidas
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center"
          onClick={() => setAberto(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-6 md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-700">Tabela de medidas</h2>
              <button
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 flex gap-2">
              {tabelaMedidas.map(({ tamanho }) => (
                <button
                  key={tamanho}
                  disabled={!tamanhosDisponiveis.includes(tamanho)}
                  onClick={() => setAbaAtiva(tamanho)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm font-medium",
                    abaAtiva === tamanho
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-neutral-200 text-neutral-600 hover:border-brand-300",
                    !tamanhosDisponiveis.includes(tamanho) && "cursor-not-allowed opacity-30"
                  )}
                >
                  {tamanho}
                </button>
              ))}
            </div>

            {medidaAtiva && (
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2 text-neutral-500">Busto</td>
                    <td className="py-2 text-right font-medium">{medidaAtiva.busto} cm</td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2 text-neutral-500">Cintura</td>
                    <td className="py-2 text-right font-medium">{medidaAtiva.cintura} cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-neutral-500">Quadril</td>
                    <td className="py-2 text-right font-medium">{medidaAtiva.quadril} cm</td>
                  </tr>
                </tbody>
              </table>
            )}

            <p className="mt-4 text-xs text-neutral-400">
              Medidas do corpo em centímetros. Em caso de dúvida entre dois tamanhos, recomendamos
              escolher o maior.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
