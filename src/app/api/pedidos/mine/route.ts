import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const admin = createAdminClient();

    // Fetch user's orders
    const { data: pedidos, error: pedidosError } = await admin
      .from("pedidos")
      .select("id, status, valor_subtotal, valor_frete, valor_total, endereco_entrega, metodo_pagamento, criado_em")
      .eq("usuario_id", user.id)
      .order("criado_em", { ascending: false });

    if (pedidosError) {
      return NextResponse.json({ error: pedidosError.message }, { status: 500 });
    }

    // Fetch items for each order
    const pedidosComItens = await Promise.all(
      (pedidos || []).map(async (pedido) => {
        const { data: itens } = await admin
          .from("pedido_itens")
          .select("id, tamanho, quantidade, preco_unitario, produto_id, produtos(nome, imagem_principal)")
          .eq("pedido_id", pedido.id);

        return { ...pedido, itens: itens || [] };
      })
    );

    return NextResponse.json(pedidosComItens);
  } catch (err) {
    console.error("[pedidos/mine]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
