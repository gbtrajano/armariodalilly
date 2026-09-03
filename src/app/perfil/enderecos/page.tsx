"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Endereco } from "@/lib/types";

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

interface FormState {
  label: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  padrao: boolean;
}

const emptyForm: FormState = {
  label: "Casa",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  padrao: false,
};

export default function EnderecosPage() {
  const router = useRouter();
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarEnderecos();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function carregarEnderecos() {
    setCarregando(true);
    const res = await fetch("/api/enderecos");
    if (res.ok) {
      const data = await res.json();
      setEnderecos(data);
    } else if (res.status === 401) {
      router.replace("/perfil");
    }
    setCarregando(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function abrirNovo() {
    setForm(emptyForm);
    setEditando(null);
    setMostrarForm(true);
    setErro("");
  }

  function abrirEditar(endereco: Endereco) {
    setForm({
      label: endereco.label || "Casa",
      rua: endereco.rua,
      numero: endereco.numero,
      complemento: endereco.complemento || "",
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      estado: endereco.estado,
      cep: endereco.cep,
      padrao: endereco.padrao,
    });
    setEditando(endereco.id);
    setMostrarForm(true);
    setErro("");
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    const body = {
      ...form,
      ...(editando ? { id: editando } : {}),
    };

    const res = await fetch("/api/enderecos", {
      method: editando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setErro(data.error || "Erro ao salvar endereço.");
      setSalvando(false);
      return;
    }

    setMostrarForm(false);
    setSalvando(false);
    await carregarEnderecos();
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir este endereço?")) return;

    const res = await fetch(`/api/enderecos?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await carregarEnderecos();
    }
  }

  async function handleDefinirPadrao(id: string) {
    await fetch("/api/enderecos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, padrao: true }),
    });
    await carregarEnderecos();
  }

  function formatarEndereco(e: Endereco) {
    return `${e.rua}, ${e.numero}${e.complemento ? ` - ${e.complemento}` : ""}, ${e.bairro}, ${e.cidade} - ${e.estado}, CEP: ${e.cep}`;
  }

  if (carregando) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-neutral-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-serif font-semibold text-neutral-900">
          Meus endereços
        </h1>
        <button
          onClick={abrirNovo}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <i className="fa-solid fa-plus mr-1"></i> Novo
        </button>
      </div>

      {enderecos.length === 0 && !mostrarForm && (
        <div className="rounded-2xl border border-dashed border-brand-200 py-12 text-center">
          <i className="fa-solid fa-location-dot mb-3 text-3xl text-neutral-300"></i>
          <p className="text-neutral-500">Você ainda não cadastrou nenhum endereço.</p>
        </div>
      )}

      {enderecos.map((endereco) => (
        <div
          key={endereco.id}
          className={`mb-3 rounded-2xl border p-4 transition ${
            endereco.padrao ? "border-brand-300 bg-brand-50/40" : "border-brand-100 bg-white"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-800">
                  {endereco.label || "Endereço"}
                </span>
                {endereco.padrao && (
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                    Padrão
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-neutral-600">{formatarEndereco(endereco)}</p>
            </div>
            <div className="flex items-center gap-1">
              {!endereco.padrao && (
                <button
                  onClick={() => handleDefinirPadrao(endereco.id)}
                  className="rounded-lg px-2 py-1 text-xs text-brand-600 transition hover:bg-brand-50"
                  title="Definir como padrão"
                >
                  <i className="fa-solid fa-star"></i>
                </button>
              )}
              <button
                onClick={() => abrirEditar(endereco)}
                className="rounded-lg px-2 py-1 text-xs text-neutral-500 transition hover:bg-neutral-100"
                title="Editar"
              >
                <i className="fa-solid fa-pen"></i>
              </button>
              <button
                onClick={() => handleExcluir(endereco.id)}
                className="rounded-lg px-2 py-1 text-xs text-red-500 transition hover:bg-red-50"
                title="Excluir"
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Formulário */}
      {mostrarForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              {editando ? "Editar endereço" : "Novo endereço"}
            </h2>

            {erro && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</div>
            )}

            <form onSubmit={handleSalvar} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Label</label>
                  <select
                    name="label"
                    value={form.label}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  >
                    <option value="Casa">Casa</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-neutral-700">CEP *</label>
                  <input
                    name="cep"
                    value={form.cep}
                    onChange={handleChange}
                    placeholder="00000-000"
                    required
                    maxLength={9}
                    className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Rua *</label>
                  <input
                    name="rua"
                    value={form.rua}
                    onChange={handleChange}
                    placeholder="Rua das Flores"
                    required
                    className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Número *</label>
                  <input
                    name="numero"
                    value={form.numero}
                    onChange={handleChange}
                    placeholder="123"
                    required
                    className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">Complemento</label>
                <input
                  name="complemento"
                  value={form.complemento}
                  onChange={handleChange}
                  placeholder="Apto 101, Bloco B"
                  className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">Bairro *</label>
                <input
                  name="bairro"
                  value={form.bairro}
                  onChange={handleChange}
                  placeholder="Centro"
                  required
                  className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Cidade *</label>
                  <input
                    name="cidade"
                    value={form.cidade}
                    onChange={handleChange}
                    placeholder="São Paulo"
                    required
                    className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Estado *</label>
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  >
                    <option value="">UF</option>
                    {ESTADOS.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-neutral-600">
                <input
                  type="checkbox"
                  checked={form.padrao}
                  onChange={(e) => setForm({ ...form, padrao: e.target.checked })}
                  className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                />
                Definir como endereço padrão
              </label>

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

      <p className="mt-6 text-center text-sm text-neutral-500">
        <Link href="/perfil/conta" className="text-brand-600 transition hover:text-brand-700">
          ← Voltar para minha conta
        </Link>
      </p>
    </div>
  );
}
