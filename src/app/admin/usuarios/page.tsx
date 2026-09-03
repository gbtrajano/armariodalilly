"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Usuario {
  id: string;
  nome: string | null;
  email: string | null;
  admin: boolean;
  criado_em: string;
}

export default function AdminUsuariosPage() {
  const supabase = createClient();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    const { data } = await supabase
      .from("usuarios")
      .select("*")
      .order("criado_em", { ascending: false });

    setUsuarios(data || []);
    setCarregando(false);
  }

  async function toggleAdmin(id: string, admin: boolean) {
    await supabase.from("usuarios").update({ admin: !admin }).eq("id", id);
    carregarUsuarios();
  }

  const formatarData = (data: string) =>
    new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-neutral-900">Usuários</h1>

      {carregando ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-brand-50"></div>
          ))}
        </div>
      ) : usuarios.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 py-16 text-center">
          <i className="fa-solid fa-users mb-4 text-3xl text-neutral-300"></i>
          <p className="text-neutral-500">Nenhum usuário cadastrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {usuarios.map((usuario) => (
            <div
              key={usuario.id}
              className="flex items-center justify-between rounded-2xl border border-brand-100 bg-white p-4 transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50">
                  <i className="fa-solid fa-user text-sm text-brand-600"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-neutral-800">{usuario.nome || "Sem nome"}</p>
                    {usuario.admin && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500">{usuario.email}</p>
                  <p className="text-xs text-neutral-400">Cadastrado em {formatarData(usuario.criado_em)}</p>
                </div>
              </div>

              <button
                onClick={() => toggleAdmin(usuario.id, usuario.admin)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  usuario.admin
                    ? "bg-brand-50 text-brand-700 hover:bg-brand-100"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {usuario.admin ? "Remover admin" : "Tornar admin"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
