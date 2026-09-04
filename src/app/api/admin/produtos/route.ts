import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

async function verifyAdmin() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Não autenticado.", status: 401 as const };
  }

  const adminClient = createAdminClient();
  const { data: usuario, error: usuarioError } = await adminClient
    .from("usuarios")
    .select("admin")
    .eq("id", user.id)
    .single();

  if (usuarioError || !usuario?.admin) {
    return { error: "Sem permissão de administrador.", status: 403 as const };
  }

  return { adminClient };
}

// DELETE - Excluir produto
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do produto é obrigatório." },
        { status: 400 }
      );
    }

    // 1. Remover itens de pedido associados ao produto
    const { error: itensError } = await auth.adminClient
      .from("pedido_itens")
      .delete()
      .eq("produto_id", id);

    if (itensError) {
      console.error("[admin/produtos] Erro ao excluir itens de pedido:", itensError);
    }

    // 2. Excluir o produto (cascata para tamanhos, fotos, promoções, carrinho)
    const { error } = await auth.adminClient
      .from("produtos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[admin/produtos] Erro ao excluir produto:", error);
      return NextResponse.json(
        { error: `Erro ao excluir: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/produtos] Erro inesperado:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

// PATCH - Toggle ativo/inativo
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, ativo } = body;

    if (!id || typeof ativo !== "boolean") {
      return NextResponse.json(
        { error: "ID e campo ativo são obrigatórios." },
        { status: 400 }
      );
    }

    const { error } = await auth.adminClient
      .from("produtos")
      .update({ ativo })
      .eq("id", id);

    if (error) {
      console.error("[admin/produtos] Erro ao atualizar produto:", error);
      return NextResponse.json(
        { error: `Erro ao atualizar: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/produtos] Erro inesperado:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
