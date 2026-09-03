import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

// GET — list user's addresses
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
    const { data, error } = await admin
      .from("enderecos")
      .select("*")
      .eq("usuario_id", user.id)
      .order("padrao", { ascending: false })
      .order("criado_em", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[enderecos GET]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// POST — create a new address
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

    const body = await request.json();
    const { label, rua, numero, complemento, bairro, cidade, estado, cep, padrao } = body;

    if (!rua || !numero || !bairro || !cidade || !estado || !cep) {
      return NextResponse.json(
        { error: "Campos obrigatórios: rua, número, bairro, cidade, estado, CEP." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // If setting as default, unset other defaults first
    if (padrao) {
      await admin
        .from("enderecos")
        .update({ padrao: false })
        .eq("usuario_id", user.id)
        .eq("padrao", true);
    }

    // If this is the first address, force it as default
    const { count } = await admin
      .from("enderecos")
      .select("id", { count: "exact", head: true })
      .eq("usuario_id", user.id);

    const { data, error } = await admin
      .from("enderecos")
      .insert({
        usuario_id: user.id,
        label: label || "Casa",
        rua,
        numero,
        complemento: complemento || null,
        bairro,
        cidade,
        estado,
        cep,
        padrao: padrao || count === 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[enderecos POST]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// PUT — update an address (set as default, edit fields)
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

    const body = await request.json();
    const { id, padrao, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do endereço é obrigatório." }, { status: 400 });
    }

    const admin = createAdminClient();

    // If setting as default, unset other defaults first
    if (padrao) {
      await admin
        .from("enderecos")
        .update({ padrao: false })
        .eq("usuario_id", user.id)
        .eq("padrao", true);
    }

    const updateFields: Record<string, unknown> = { ...fields };
    if (padrao !== undefined) updateFields.padrao = padrao;

    const { data, error } = await admin
      .from("enderecos")
      .update(updateFields)
      .eq("id", id)
      .eq("usuario_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[enderecos PUT]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// DELETE — remove an address
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do endereço é obrigatório." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("enderecos")
      .delete()
      .eq("id", id)
      .eq("usuario_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[enderecos DELETE]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
