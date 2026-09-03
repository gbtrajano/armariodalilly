import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    // Pegar o usuário autenticado via cookie (sem RLS, apenas auth)
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ isAdmin: false });
    }

    // Usar o admin client (service role) para bypass de RLS
    const adminSupabase = createAdminClient();

    // Verificar se existe row na tabela usuarios
    const { data: usuario, error } = await adminSupabase
      .from("usuarios")
      .select("admin")
      .eq("id", user.id)
      .single();

    if (error || !usuario) {
      // Usuário não tem row na tabela usuarios — criar automaticamente
      await adminSupabase.from("usuarios").upsert({
        id: user.id,
        email: user.email,
        nome: user.user_metadata?.name ?? user.email,
        admin: false,
      });
      return NextResponse.json({ isAdmin: false });
    }

    return NextResponse.json({ isAdmin: !!usuario.admin });
  } catch (err) {
    console.error("[is-admin] erro:", err);
    return NextResponse.json({ isAdmin: false });
  }
}
