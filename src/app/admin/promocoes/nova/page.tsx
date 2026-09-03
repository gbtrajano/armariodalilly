"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  imagem_principal: string | null;
}

export default function NovaPromocaoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [salvando, setSalvando] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    desconto_percentual: "",
    data_inicio: "",
    data_fim: "",
  });

  const [produtosSelecionados, setProdutosSelecionados] = useState<Record<string, number>>({});

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("produtos")
        .select("id, nome, preco, categoria, imagem_principal")
        .eq("ativo", true)
        .order("nome");
      setProdutos(data || []);
    }
    carregar();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleProduto = (id: string, preco: number) => {
    if (produtosSelecionados[id]) {
      const novo = { ...produtosSelecionados };
      delete novo[id];
      setProdutosSelecionados(novo);
    } else {
      const desconto = form.desconto_percentual ? parseFloat(form.desconto_percentual) : 0;
      const precoPromocional = desconto > 0
        ? Math.round(preco * (1 - desconto / 100) * 100) / 100
        : preco;
      setProdutosSelecionados({ ...produtosSelecionados, [id]: precoPromocional });
    }
  };

  const atualizarPrecos = () => {
    const desconto = form.desconto_percentual ? parseFloat(form.desconto_percentual) : 0;
    if (desconto <= 0) return;

    const novos: Record<string, number> = {};
    Object.keys(produtosSelecionados).forEach((id) => {
      const produto = produtos.find((p) => p.id === id);
      if (produto) {
        novos[id] = Math.round(produto.preco * (1 - desconto / 100) * 100) / 100;
      }
    });
    setProdutosSelecionados(novos);
  };

  useEffect(() => {
    atualizarPrecos();
  }, [form.desconto_percentual]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    const { data: promo, error } = await supabase
      .from("promocoes_semana")
      .insert({
        titulo: form.titulo,
        descricao: form.descricao || null,
        desconto_percentual: form.desconto_percentual ? parseInt(form.desconto_percentual) : null,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim,
        ativa: true,
      })
      .select()
      .single();

    if (error || !promo) {
      alert("Erro ao criar promoção");
      setSalvando(false);
      return;
    }

    // Inserir produtos na promoção
    const produtosParaInserir = Object.entries(produtosSelecionados).map(([produtoId, preco]) => ({
      promocao_id: promo.id,
      produto_id: produtoId,
      preco_promocional: preco,
    }));

    if (produtosParaInserir.length > 0) {
      await supabase.from("promocao_produtos").insert(produtosParaInserir);

      // Atualizar preço promocional nos produtos
      for (const [produtoId, preco] of Object.entries(produtosSelecionados)) {
        await supabase.from("produtos").update({ preco_promocional: preco }).eq("id", produtoId);
      }
    }

    router.push("/admin/promocoes");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-2xl font-semibold text-neutral-900">Nova Promoção</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-neutral-800">Dados da promoção</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Título *</label>
              <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                required
                placeholder="Ex: Semana de Outono"
                className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Descrição</label>
              <textarea
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                rows={2}
                placeholder="Descreva a promoção..."
                className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Desconto (%)</label>
                <input
                  name="desconto_percentual"
                  type="number"
                  min="1"
                  max="100"
                  value={form.desconto_percentual}
                  onChange={handleChange}
                  placeholder="Ex: 20"
                  className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Início *</label>
                <input
                  name="data_inicio"
                  type="date"
                  value={form.data_inicio}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Fim *</label>
                <input
                  name="data_fim"
                  type="date"
                  value={form.data_fim}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-neutral-800">
            Selecionar produtos
            {Object.keys(produtosSelecionados).length > 0 && (
              <span className="ml-2 text-sm font-normal text-brand-600">
                ({Object.keys(produtosSelecionados).length} selecionados)
              </span>
            )}
          </h2>
          {produtos.length === 0 ? (
            <p className="text-sm text-neutral-500">Nenhum produto ativo disponível.</p>
          ) : (
            <div className="space-y-2">
              {produtos.map((produto) => (
                <label
                  key={produto.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                    produtosSelecionados[produto.id]
                      ? "border-brand-300 bg-brand-50"
                      : "border-brand-100 hover:bg-brand-50/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!produtosSelecionados[produto.id]}
                    onChange={() => toggleProduto(produto.id, produto.preco)}
                    className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-800">{produto.nome}</p>
                    <p className="text-xs text-neutral-500">{produto.categoria}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-400 line-through">R$ {produto.preco.toFixed(2)}</p>
                    {produtosSelecionados[produto.id] && (
                      <p className="text-sm font-semibold text-brand-700">
                        R$ {produtosSelecionados[produto.id].toFixed(2)}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={salvando || Object.keys(produtosSelecionados).length === 0}
            className="rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Criar promoção"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-brand-200 px-6 py-3 text-sm font-medium text-neutral-600 transition hover:bg-brand-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
