export type Tamanho = "PP" | "P" | "M" | "G" | "GG";

export interface Produto {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  preco: number;
  precoPromocional?: number;
  imagem: string;
  categoria: string;
  tamanhosDisponiveis: Tamanho[];
  pesoGramas: number; // usado no cálculo de frete
  altura: number; // cm - dimensões da embalagem
  largura: number;
  comprimento: number;
}

export interface ItemCarrinho {
  produtoId: string;
  slug: string;
  nome: string;
  imagem: string;
  preco: number;
  tamanho: Tamanho;
  quantidade: number;
}

export interface OpcaoFrete {
  transportadora: string;
  servico: string;
  prazoDias: number;
  valor: number;
}

export interface MedidaTamanho {
  tamanho: Tamanho;
  busto: number;
  cintura: number;
  quadril: number;
}

export interface Endereco {
  id: string;
  usuario_id: string;
  label: string;
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  padrao: boolean;
  criado_em: string;
}
