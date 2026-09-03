"use client";

import { useEffect, useState } from "react";

interface Cupom {
  id: string;
  codigo: string;
  descricao: string | null;
  desconto_percentual: number | null;
  desconto_fixo: number | null;
  valor_minimo: number;
  uso_maximo: number;
  uso_atual: number;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
  criado_em: string;
}

interface FormState {
  codigo: string;
  descricao: string;
  desconto_percentual: string;
  desconto_fixo: string;
  valor_minimo: string;
  uso_maximo: string;
  data_inicio: string;
  data_fim: string;
}

const emptyForm: FormState = {
  codigo: "",
  descricao: "",
  desconto_percentual: "",
  desconto_fixo: "",
  valor_minimo: "0",
  uso_maximo: "1",
  data_inicio: "",
  data_fim: "",
};

export default function AdminCuponsPage() {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarCupons();
  }, []);

  async function carregarCupons() {
    setCarregando(true);
    const res = await fetch("/api/admin/cupons");
    if (res.ok) {
      const data = await res.json();
      setCupons(data);
    }
    setCarregando(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function abrirNovo() {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    setForm({
      ...emptyForm,
      data_inicio: now.toISOString().slice(0, 16),
      data_fim: nextMonth.toISOString().slice(0, 16),
    });
    setEditando(null);
    setMostrarForm(true);
    setErro("");
  }

  function abrirEditar(cupom: Cupom) {
    setForm({
      codigo: cupom.codigo,
      descricao: cupom.descricao || "",
      desconto_percentual: cupom.desconto_percentual ? String(cupom.desconto_percentual) : "",
      desconto_fixo: cupom.desconto_fixo ? String(cupom.desconto_fixo) : "",
      valor_minimo: String(cupom.valor_minimo),
      uso_maximo: String(cupom.uso_maximo),
      data_inicio: cupom.data_inicio ? new Date(cupom.data_inicio).toISOString().slice(0, 16) : "",
      data_fim: cupom.data_fim ? new Date(cupom.data_fim).toISOString().slice(0, 16) : "",
    });
    setEditando(cupom.id);
    setMostrarForm(true);
    setErro("");
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    if (!form.desconto_percentual && !form.desconto_fixo) {
      setErro("Informe o desconto percentual ou fixo.");
      setSalvando(false);
      return;
    }

    const body = {
      ...(editando ? { id: editando } : {}),
      codigo: form.codigo,
      descricao: form.descricao || null,
      desconto_percentual: form.desconto_percentual ? parseInt(form.desconto_percentual) : null,
      desconto_fixo: form.desconto_fixo ? parseFloat(form.desconto_fixo) : null,
      valor_minimo: parseFloat(form.valor_minimo) || 0,
      uso_maximo: parseInt(form.uso_maximo) || 1,
      data_inicio: form.data_inicio ? new Date(form.data_inicio).toISOString() : new Date().toISOString(),
      data_fim: new Date(form.data_fim).toISOString(),
    };

    const res = await fetch("/api/admin/cupons", {
      method: editando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setErro(data.error || "Erro ao salvar cupom.");
      setSalvando(false);
      return;
    }

    setMostrarForm(false);
    setSalvando(false);
    await carregarCupons();
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir este cupom?")) return;
    const res = await fetch(`/api/admin/cupons?id=${id}`, { method: "DELETE" });
    if (res.ok) await carregarCupons();
  }

  async function handleToggleAtivo(cupom: Cupom) {
    await fetch("/api/admin/cupons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cupom.id, ativo: !cupom.ativo }),
    });
    await carregarCupons();
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatarDesconto(cupom: Cupom) {
    if (cupom.desconto_percentual) return `${cupom.desconto_percentual}%`;
    if (cupom.desconto_fixo) return `R$ ${cupom.desconto_fixo.toFixed(2).replace(".", ",")}`;
    return "—";
  }

  function estaExpirado(cupom: Cupom) {
    return new Date(cupom.data_fim) < new Date();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Cupons</h1>
        <button
          onClick={abrirNovo}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <i className="fa-solid fa-plus mr-1"></i> Novo cupom
        </button>
      </div>

      {carregando ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-brand-50"></div>
          ))}
        </div>
      ) : cupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 py-16 text-center">
          <i className="fa-solid fa-ticket mb-4 text-3xl text-neutral-300"></i>
          <p className="text-neutral-500">Nenhum cupom criado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cupons.map((cupom) => (
            <div
              key={cupom.id}
              className={`rounded-2xl border p-4 transition ${
                !cupom.ativo || estaExpirado(cupom)
                  ? "border-neutral-200 bg-neutral-50 opacity-70"
                  : "border-brand-100 bg-white hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-brand-100 px-2.5 py-1 font-mono text-sm font-bold text-brand-700">
                      {cupom.codigo}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      estaExpirado(cupom)
                        ? "bg-neutral-100 text-neutral-500"
                        : cupom.ativo
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                    }`}>
                      {estaExpirado(cupom) ? "Expirado" : cupom.ativo ? "Ativo" : "Inativo"}
                    </span>
                    <span className="text-sm font-semibold text-neutral-800">
                      {formatarDesconto(cupom)}
                    </span>
                  </div>
                  {cupom.descricao && (
                    <p className="mt-1 text-xs text-neutral-500">{cupom.descricao}</p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-neutral-400">
                    {cupom.valor_minimo > 0 && (
                      <span>Mínimo: R$ {cupom.valor_minimo.toFixed(2).replace(".", ",")}</span>
                    )}
                    <span>Usos: {cupom.uso_atual}/{cupom.uso_maximo}</span>
                    <span>Válido até: {formatarData(cupom.data_fim)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleAtivo(cupom)}
                    className={`rounded-lg px-2 py-1 text-xs transition ${
                      cupom.ativo ? "text-green-600 hover:bg-green-50" : "text-neutral-400 hover:bg-neutral-100"
                    }`}
                    title={cupom.ativo ? "Desativar" : "Ativar"}
                  >
                    <i className={`fa-solid ${cupom.ativo ? "fa-toggle-on" : "fa-toggle-off"}`}></i>
                  </button>
                  <button
                    onClick={() => abrirEditar(cupom)}
                    className="rounded-lg px-2 py-1 text-xs text-neutral-500 transition hover:bg-neutral-100"
                    title="Editar"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button
                    onClick={() => handleExcluir(cupom.id)}
                    className="rounded-lg px-2 py-1 text-xs text-red-500 transition hover:bg-red-50"
                    title="Excluir"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {mostrarForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              {editando ? "Editar cupom" : "Novo cupom"}
            </h2>

            {erro && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</div>
            )}

            <form onSubmit={handleSalvar} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">Código *</label>
                <input
                  name="codigo"
                  value={form.codigo}
                  onChange={handleChange}
                  placeholder="EX: VERAO20"
                  required
                  className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm font-mono uppercase outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">Descrição</label>
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  placeholder="Ex: Desconto de verão"
                  rows={2}
                  className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Desconto %</label>
                  <input
                    name="desconto_percentual"
                    type="number"
                    min="1"
                    max="100"
                    value={form.desconto_percentual}
                    onChange={handleChange}
                    placeholder="10"
                    className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Desconto R$</label>
                  <input
                    name="desconto_fixo"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.desconto_fixo}
                    onChange={handleChange}
                    placeholder="15.00"
                    className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Valor mínimo (R$)</label>
                  <input
                    name="valor_minimo"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.valor_minimo}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Limite de usos</label>
                  <input
                    name="uso_maximo"
                    type="number"
                    min="1"
                    value={form.uso_maximo}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Início</label>
                  <input
                    name="data_inicio"
                    type="datetime-local"
                    value={form.data_inicio}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Término *</label>
                  <input
                    name="data_fim"
                    type="datetime-local"
                    value={form.data_fim}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarForm(false)}
                  className="flex-1 rounded-full border border-brand-200 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-brand-50/50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
                >
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
