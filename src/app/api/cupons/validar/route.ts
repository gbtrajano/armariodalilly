import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const { codigo, subtotal } = await request.json();

    if (!codigo) {
      return NextResponse.json({ error: "Informe o código do cupom." }, { status: 400 });
    }

    const admin = createAdminClient();
    const now = new Date().toISOString();

    // Find the coupon
    const { data: cupom, error } = await admin
      .from("cupons")
      .select("*")
      .eq("codigo", codigo.toUpperCase().trim())
      .single();

    if (error || !cupom) {
      return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });
    }

    // Check if active
    if (!cupom.ativo) {
      return NextResponse.json({ error: "Este cupom está desativado." }, { status: 400 });
    }

    // Check date range
    if (now < cupom.data_inicio) {
      return NextResponse.json({ error: "Este cupom ainda não está ativo." }, { status: 400 });
    }
    if (now > cupom.data_fim) {
      return NextResponse.json({ error: "Este cupom expirou." }, { status: 400 });
    }

    // Check usage limit
    if (cupom.uso_atual >= cupom.uso_maximo) {
      return NextResponse.json({ error: "Este cupom atingiu o limite de uso." }, { status: 400 });
    }

    // Check minimum value
    if (cupom.valor_minimo > 0 && subtotal < cupom.valor_minimo) {
      return NextResponse.json(
        { error: `Valor mínimo para este cupom: R$ ${cupom.valor_minimo.toFixed(2).replace(".", ",")}` },
        { status: 400 }
      );
    }

    // Calculate discount
    let desconto = 0;
    if (cupom.desconto_percentual) {
      desconto = (subtotal * cupom.desconto_percentual) / 100;
    } else if (cupom.desconto_fixo) {
      desconto = Math.min(cupom.desconto_fixo, subtotal);
    }

    return NextResponse.json({
      codigo: cupom.codigo,
      descricao: cupom.descricao,
      desconto_percentual: cupom.desconto_percentual,
      desconto_fixo: cupom.desconto_fixo,
      desconto: Math.round(desconto * 100) / 100,
    });
  } catch (err) {
    console.error("[cupons/validar]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
