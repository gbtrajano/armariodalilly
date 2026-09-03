import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

interface CartItem {
  produtoId: string;
  slug: string;
  nome: string;
  imagem: string;
  preco: number;
  tamanho: string;
  quantidade: number;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the user is authenticated
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Você precisa estar logado para finalizar a compra." },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { itens, enderecoEntrega, metodoPagamento } = body as {
      itens: CartItem[];
      enderecoEntrega: string;
      metodoPagamento: string;
    };

    if (!itens || itens.length === 0) {
      return NextResponse.json(
        { error: "Carrinho vazio." },
        { status: 400 }
      );
    }

    if (!enderecoEntrega) {
      return NextResponse.json(
        { error: "Endereço de entrega é obrigatório." },
        { status: 400 }
      );
    }

    // 3. Calculate totals
    const valorSubtotal = itens.reduce(
      (soma, item) => soma + item.preco * item.quantidade,
      0
    );
    const valorFrete = 0; // TODO: calcular frete real
    const valorTotal = valorSubtotal + valorFrete;

    // 4. Create the order using admin client (bypasses RLS)
    const admin = createAdminClient();

    const { data: pedido, error: pedidoError } = await admin
      .from("pedidos")
      .insert({
        usuario_id: user.id,
        status: "pendente",
        valor_subtotal: valorSubtotal,
        valor_frete: valorFrete,
        valor_total: valorTotal,
        endereco_entrega: enderecoEntrega,
        metodo_pagamento: metodoPagamento || "pix",
      })
      .select()
      .single();

    if (pedidoError) {
      console.error("[pedidos] Erro ao criar pedido:", pedidoError);
      return NextResponse.json(
        { error: `Erro ao criar pedido: ${pedidoError.message}` },
        { status: 500 }
      );
    }

    // 5. Create order items
    const pedidoItens = itens.map((item) => ({
      pedido_id: pedido.id,
      produto_id: item.produtoId,
      tamanho: item.tamanho,
      quantidade: item.quantidade,
      preco_unitario: item.preco,
    }));

    const { error: itensError } = await admin
      .from("pedido_itens")
      .insert(pedidoItens);

    if (itensError) {
      console.error("[pedidos] Erro ao criar itens do pedido:", itensError);
      // Order was created but items failed — still return success with warning
    }

    return NextResponse.json({
      pedidoId: pedido.id,
      valorTotal,
    });
  } catch (err) {
    console.error("[pedidos] Erro inesperado:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
