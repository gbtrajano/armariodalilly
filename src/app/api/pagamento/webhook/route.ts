import { NextRequest, NextResponse } from "next/server";

// -----------------------------------------------------------------------------
// Endpoint que receberá as notificações do gateway de pagamento (Mercado Pago,
// Asaas ou Pagar.me). Configure esta URL no painel do gateway escolhido.
//
// Fluxo recomendado:
// 1. Validar a assinatura/segredo enviado pelo gateway (evita chamadas falsas).
// 2. Buscar o pedido correspondente no banco (por id externo do pagamento).
// 3. Atualizar o status do pedido para "pago".
// 4. (Opcional) Chamar a API da transportadora para gerar a etiqueta de envio.
// 5. Responder 200 rapidamente para o gateway não reenviar o webhook.
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const evento = await request.json();

  // TODO: validar assinatura do webhook conforme documentação do gateway.
  // TODO: buscar pedido no banco (Supabase) usando evento.data.id ou similar.
  // TODO: se status === "approved" / "paid", atualizar pedido e disparar
  //       geração de etiqueta via API da transportadora.

  console.log("Webhook de pagamento recebido:", evento);

  return NextResponse.json({ recebido: true });
}
