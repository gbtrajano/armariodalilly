import { NextRequest, NextResponse } from "next/server";
import { OpcaoFrete } from "@/lib/types";

interface CorpoRequisicao {
  cepDestino: string;
  pesoGramas: number;
  altura: number;
  largura: number;
  comprimento: number;
}

// -----------------------------------------------------------------------------
// Esta rota hoje retorna valores simulados para você poder testar o front-end
// sem depender de credenciais externas. Para produção, troque o bloco abaixo
// por uma chamada real à API do Melhor Envio ou Frenet, por exemplo:
//
// const resposta = await fetch("https://www.melhorenvio.com.br/api/v2/me/shipment/calculate", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
//   },
//   body: JSON.stringify({
//     from: { postal_code: process.env.CEP_ORIGEM },
//     to: { postal_code: corpo.cepDestino },
//     package: {
//       weight: corpo.pesoGramas / 1000,
//       width: corpo.largura,
//       height: corpo.altura,
//       length: corpo.comprimento,
//     },
//   }),
// });
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const corpo = (await request.json()) as CorpoRequisicao;

  if (!corpo.cepDestino || corpo.cepDestino.length !== 8) {
    return NextResponse.json({ erro: "CEP inválido." }, { status: 400 });
  }

  const fatorPeso = Math.max(1, corpo.pesoGramas / 500);

  const opcoes: OpcaoFrete[] = [
    {
      transportadora: "Correios",
      servico: "PAC",
      prazoDias: 7,
      valor: Number((14.9 + fatorPeso * 2.5).toFixed(2))
    },
    {
      transportadora: "Correios",
      servico: "SEDEX",
      prazoDias: 3,
      valor: Number((24.9 + fatorPeso * 4).toFixed(2))
    },
    {
      transportadora: "Jadlog",
      servico: "Package",
      prazoDias: 5,
      valor: Number((19.9 + fatorPeso * 3).toFixed(2))
    }
  ];

  return NextResponse.json({ opcoes });
}
