"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

const categorias = ["Vestidos", "Blusas", "Calças", "Saias", "Acessórios"];
const tamanhos = ["PP", "P", "M", "G", "GG"];

export default function EditarProdutoPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    preco_promocional: "",
    categoria: "Vestidos",
    imagem_principal: "",
    peso_gramas: "350",
    altura: "4",
    largura: "25",
    comprimento: "32",
  });

  const [estoques, setEstoques] = useState<Record<string, number>>({});
  const [tamanhosAtivos, setTamanhosAtivos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function carregar() {
      const { data: produto } = await supabase
        .from("produtos")
        .select("*, produto_tamanhos(tamanho, estoque)")
        .eq("id", params.id)
        .single();

      if (produto) {
        setForm({
          nome: produto.nome,
          descricao: produto.descricao || "",
          preco: String(produto.preco),
          preco_promocional: produto.preco_promocional ? String(produto.preco_promocional) : "",
          categoria: produto.categoria,
          imagem_principal: produto.imagem_principal || "",
          peso_gramas: String(produto.peso_gramas),
          altura: String(produto.altura),
          largura: String(produto.largura),
          comprimento: String(produto.comprimento),
        });

        const estoquesInit: Record<string, number> = {};
        const ativosInit: Record<string, boolean> = {};
        tamanhos.forEach((t) => {
          const tam = produto.produto_tamanhos?.find((x: { tamanho: string }) => x.tamanho === t);
          estoquesInit[t] = tam?.estoque ?? 0;
          ativosInit[t] = !!tam;
        });
        setEstoques(estoquesInit);
        setTamanhosAtivos(ativosInit);
      }
      setCarregando(false);
    }
    carregar();
  }, [params.id, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagemArquivo(file);
      setImagemPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    let imageUrl = form.imagem_principal;

    if (imagemArquivo) {
      const formData = new FormData();
      formData.append('file', imagemArquivo);
      
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          imageUrl = data.url;
        } else {
          alert("Erro no upload da imagem: " + data.message);
          setSalvando(false);
          return;
        }
      } catch (error) {
        alert("Erro no upload da imagem");
        setSalvando(false);
        return;
      }
    }

    await supabase
      .from("produtos")
      .update({
        nome: form.nome,
        descricao: form.descricao,
        preco: parseFloat(form.preco),
        preco_promocional: form.preco_promocional ? parseFloat(form.preco_promocional) : null,
        imagem_principal: imageUrl || null,
        categoria: form.categoria,
        peso_gramas: parseInt(form.peso_gramas),
        altura: parseInt(form.altura),
        largura: parseInt(form.largura),
        comprimento: parseInt(form.comprimento),
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", params.id);

    // Atualizar tamanhos
    await supabase.from("produto_tamanhos").delete().eq("produto_id", params.id);

    const tamanhosParaInserir = tamanhos
      .filter((t) => tamanhosAtivos[t])
      .map((t) => ({
        produto_id: params.id as string,
        tamanho: t,
        estoque: estoques[t] || 0,
      }));

    if (tamanhosParaInserir.length > 0) {
      await supabase.from("produto_tamanhos").insert(tamanhosParaInserir);
    }

    router.push("/admin/produtos");
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fa-solid fa-spinner fa-spin text-2xl text-brand-500"></i>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-2xl font-semibold text-neutral-900">Editar Produto</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-neutral-800">Dados do produto</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Nome *</label>
              <input name="nome" value={form.nome} onChange={handleChange} required className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Descrição</label>
              <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3} className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Categoria *</label>
                <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Imagem do produto</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                {(imagemPreview || form.imagem_principal) && (
                  <div className="mt-4">
                    <img src={imagemPreview || form.imagem_principal} alt="Preview" className="h-32 w-32 object-cover rounded-xl border border-brand-200 shadow-sm" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-neutral-800">Preços</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Preço (R$) *</label>
              <input name="preco" type="number" step="0.01" min="0" value={form.preco} onChange={handleChange} required className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Preço promocional (R$)</label>
              <input name="preco_promocional" type="number" step="0.01" min="0" value={form.preco_promocional} onChange={handleChange} className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-neutral-800">Tamanhos e Estoque</h2>
          <div className="space-y-3">
            {tamanhos.map((tam) => (
              <div key={tam} className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={tamanhosAtivos[tam] || false} onChange={(e) => setTamanhosAtivos({ ...tamanhosAtivos, [tam]: e.target.checked })} className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500" />
                  <span className="w-8 text-sm font-medium text-neutral-700">{tam}</span>
                </label>
                {tamanhosAtivos[tam] && (
                  <input type="number" min="0" value={estoques[tam] || 0} onChange={(e) => setEstoques({ ...estoques, [tam]: parseInt(e.target.value) || 0 })} className="w-24 rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-1.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-neutral-800">Dimensões da embalagem</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Peso (g)</label>
              <input name="peso_gramas" type="number" value={form.peso_gramas} onChange={handleChange} className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Altura (cm)</label>
              <input name="altura" type="number" value={form.altura} onChange={handleChange} className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Largura (cm)</label>
              <input name="largura" type="number" value={form.largura} onChange={handleChange} className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Comprimento (cm)</label>
              <input name="comprimento" type="number" value={form.comprimento} onChange={handleChange} className="w-full rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={salvando} className="rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50">
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-full border border-brand-200 px-6 py-3 text-sm font-medium text-neutral-600 transition hover:bg-brand-50">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
