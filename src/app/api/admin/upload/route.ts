import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the user is authenticated via cookies
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    // 2. Verify the user is an admin
    const adminClient = createAdminClient();
    const { data: usuario, error: usuarioError } = await adminClient
      .from("usuarios")
      .select("admin")
      .eq("id", user.id)
      .single();

    if (usuarioError || !usuario?.admin) {
      return NextResponse.json(
        { error: "Sem permissão de administrador." },
        { status: 403 }
      );
    }

    // 3. Read the uploaded file from the request
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    // 4. Upload to Supabase Storage using the admin client (bypasses RLS)
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await adminClient.storage
      .from("produtos")
      .upload(fileName, file);

    if (uploadError) {
      console.error("[upload] Erro no upload:", uploadError);
      return NextResponse.json(
        { error: `Erro no upload: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 5. Get the public URL
    const {
      data: { publicUrl },
    } = adminClient.storage.from("produtos").getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("[upload] Erro inesperado:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
