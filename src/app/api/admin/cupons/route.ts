import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

// GET — list all coupons
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
    const { data: usuario } = await admin
      .from("usuarios")
      .select("admin")
      .eq("id", user.id)
      .single();

    if (!usuario?.admin) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    const { data, error } = await admin
      .from("cupons")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[admin/cupons GET]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// POST — create a new coupon
export async function POST(request: NextRequest) {
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
    const { data: usuario } = await admin
      .from("usuarios")
      .select("admin")
      .eq("id", user.id)
      .single();

    if (!usuario?.admin) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    const body = await request.json();
    const { codigo, descricao, desconto_percentual, desconto_fixo, valor_minimo, uso_maximo, data_inicio, data_fim } = body;

    if (!codigo || !data_fim) {
      return NextResponse.json(
        { error: "Código e data de término são obrigatórios." },
        { status: 400 }
      );
    }

    if (!desconto_percentual && !desconto_fixo) {
      return NextResponse.json(
        { error: "Informe o desconto percentual ou fixo." },
        { status: 400 }
      );
    }

    const { data, error } = await admin
      .from("cupons")
      .insert({
        codigo: codigo.toUpperCase().trim(),
        descricao: descricao || null,
        desconto_percentual: desconto_percentual || null,
        desconto_fixo: desconto_fixo || null,
        valor_minimo: valor_minimo || 0,
        uso_maximo: uso_maximo || 1,
        data_inicio: data_inicio || new Date().toISOString(),
        data_fim,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Já existe um cupom com este código." }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[admin/cupons POST]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// PUT — update a coupon
export async function PUT(request: NextRequest) {
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
    const { data: usuario } = await admin
      .from("usuarios")
      .select("admin")
      .eq("id", user.id)
      .single();

    if (!usuario?.admin) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do cupom é obrigatório." }, { status: 400 });
    }

    // Uppercase code if being updated
    if (fields.codigo) fields.codigo = fields.codigo.toUpperCase().trim();

    const { data, error } = await admin
      .from("cupons")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Já existe um cupom com este código." }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[admin/cupons PUT]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// DELETE — delete a coupon
export async function DELETE(request: NextRequest) {
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
    const { data: usuario } = await admin
      .from("usuarios")
      .select("admin")
      .eq("id", user.id)
      .single();

    if (!usuario?.admin) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do cupom é obrigatório." }, { status: 400 });
    }

    const { error } = await admin.from("cupons").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/cupons DELETE]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
