import { NextRequest, NextResponse } from "next/server";

interface CorpoDevolucao {
  pedidoId: string;
  itens: string[];
  motivo: string;
}

// -----------------------------------------------------------------------------
// Solicitação de troca/devolução feita pela cliente em /minha-conta/pedidos.
// Em produção, este endpoint deve:
// 1. Validar se o pedido está dentro do prazo (ex.: 7 dias após entrega).
// 2. Registrar a solicitação no banco de dados com status "pendente".
// 3. Chamar a API de logística reversa (ex.: Melhor Envio
//    POST /api/v2/me/shipment/reverse) para gerar o código de postagem.
// 4. Retornar o código de postagem para o front-end exibir para a cliente.
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const corpo = (await request.json()) as CorpoDevolucao;

  if (!corpo.pedidoId || !corpo.itens?.length) {
    return NextResponse.json({ erro: "Dados de devolução incompletos." }, { status: 400 });
  }

  // TODO: substituir pelo código de postagem real vindo da API da transportadora.
  const codigoPostagemSimulado = `DEV-${corpo.pedidoId}-${Date.now().toString().slice(-6)}`;

  return NextResponse.json({
    status: "solicitacao_criada",
    codigoPostagem: codigoPostagemSimulado,
    mensagem: "Leve a peça a qualquer agência dos Correios usando este código."
  });
}
