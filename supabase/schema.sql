-- =====================================================
-- ARMÁRIO DA LILLY - Database Schema
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  preco_promocional DECIMAL(10,2),
  imagem_principal TEXT,
  categoria TEXT NOT NULL,
  peso_gramas INTEGER DEFAULT 350,
  altura INTEGER DEFAULT 4,
  largura INTEGER DEFAULT 25,
  comprimento INTEGER DEFAULT 32,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE TAMANHOS POR PRODUTO
CREATE TABLE IF NOT EXISTS produto_tamanhos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  tamanho TEXT NOT NULL CHECK (tamanho IN ('PP', 'P', 'M', 'G', 'GG')),
  estoque INTEGER NOT NULL DEFAULT 0,
  UNIQUE (produto_id, tamanho)
);

-- 3. TABELA DE FOTOS EXTRAS DO PRODUTO
CREATE TABLE IF NOT EXISTS produto_fotos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE PROMOÇÕES DA SEMANA
CREATE TABLE IF NOT EXISTS promocoes_semana (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  desconto_percentual INTEGER CHECK (desconto_percentual BETWEEN 1 AND 100),
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  ativa BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE PRODUTOS NA PROMOÇÃO
CREATE TABLE IF NOT EXISTS promocao_produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promocao_id UUID NOT NULL REFERENCES promocoes_semana(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  preco_promocional DECIMAL(10,2) NOT NULL,
  UNIQUE (promocao_id, produto_id)
);

-- 6. TABELA DE USUÁRIOS (perfis)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  admin BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE ENDEREÇOS
CREATE TABLE IF NOT EXISTS enderecos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Casa',
  rua TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  cep TEXT NOT NULL,
  padrao BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABELA DE PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'enviado', 'entregue', 'cancelado')),
  valor_subtotal DECIMAL(10,2) NOT NULL,
  valor_frete DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  endereco_entrega JSONB NOT NULL,
  codigo_rastreio TEXT,
  metodo_pagamento TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABELA DE ITENS DO PEDIDO
CREATE TABLE IF NOT EXISTS pedido_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id),
  tamanho TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL
);

-- 10. TABELA DE CARRINHO
CREATE TABLE IF NOT EXISTS carrinho (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  tamanho TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (usuario_id, produto_id, tamanho)
);

-- =====================================================
-- INDEXES para performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_slug ON produtos(slug);
CREATE INDEX IF NOT EXISTS idx_produto_tamanhos_produto ON produto_tamanhos(produto_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_carrinho_usuario ON carrinho(usuario_id);
CREATE INDEX IF NOT EXISTS idx_promocoes_ativa ON promocoes_semana(ativa);

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Função auxiliar: verifica se o usuário atual é admin
-- SECURITY DEFINER garante que a função roda fora do RLS, evitando recursão
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid() AND admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Produtos: público para leitura, admin para escrita
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Produtos públicos para leitura" ON produtos FOR SELECT USING (true);
CREATE POLICY "Admin pode inserir produtos" ON produtos FOR INSERT WITH CHECK (
  public.is_admin()
);
CREATE POLICY "Admin pode atualizar produtos" ON produtos FOR UPDATE USING (
  public.is_admin()
);
CREATE POLICY "Admin pode deletar produtos" ON produtos FOR DELETE USING (
  public.is_admin()
);

-- Produto Tamanhos: público para leitura, admin para escrita
ALTER TABLE produto_tamanhos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tamanhos públicos para leitura" ON produto_tamanhos FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar tamanhos" ON produto_tamanhos FOR ALL USING (
  public.is_admin()
);

-- Produto Fotos: público para leitura, admin para escrita
ALTER TABLE produto_fotos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotos públicas para leitura" ON produto_fotos FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar fotos" ON produto_fotos FOR ALL USING (
  public.is_admin()
);

-- Promoções: público para leitura, admin para escrita
ALTER TABLE promocoes_semana ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Promoções públicas para leitura" ON promocoes_semana FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar promoções" ON promocoes_semana FOR ALL USING (
  public.is_admin()
);

-- Promoção Produtos: público para leitura, admin para escrita
ALTER TABLE promocao_produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Promoção produtos públicos para leitura" ON promocao_produtos FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar promoção produtos" ON promocao_produtos FOR ALL USING (
  public.is_admin()
);

-- Usuários: cada um vê seu próprio perfil, admin vê todos
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário vê seu próprio perfil" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuário atualiza seu próprio perfil" ON usuarios FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin vê todos os usuários" ON usuarios FOR SELECT USING (
  public.is_admin()
);
CREATE POLICY "Admin pode gerenciar usuários" ON usuarios FOR ALL USING (
  public.is_admin()
);

-- Endereços: cada um vê seus próprios endereços
ALTER TABLE enderecos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário vê seus endereços" ON enderecos FOR SELECT USING (
  EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND usuario_id = enderecos.usuario_id)
);
CREATE POLICY "Usuário gerencia seus endereços" ON enderecos FOR ALL USING (
  EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND usuario_id = enderecos.usuario_id)
);

-- Pedidos: cada um vê seus próprios pedidos
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário vê seus pedidos" ON pedidos FOR SELECT USING (
  EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND usuario_id = pedidos.usuario_id)
);
CREATE POLICY "Admin vê todos os pedidos" ON pedidos FOR SELECT USING (
  public.is_admin()
);
CREATE POLICY "Admin pode atualizar pedidos" ON pedidos FOR UPDATE USING (
  public.is_admin()
);

-- Pedido Itens: cada um vê seus próprios itens
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário vê itens de seus pedidos" ON pedido_itens FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM pedidos
    WHERE pedidos.id = pedido_itens.pedido_id
    AND pedidos.usuario_id = auth.uid()
  )
);
CREATE POLICY "Admin pode ver itens de qualquer pedido" ON pedido_itens FOR SELECT USING (
  public.is_admin()
);

-- Carrinho: cada um vê seu próprio carrinho
ALTER TABLE carrinho ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário vê seu carrinho" ON carrinho FOR SELECT USING (
  EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND usuario_id = carrinho.usuario_id)
);
CREATE POLICY "Usuário gerencia seu carrinho" ON carrinho FOR ALL USING (
  EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND usuario_id = carrinho.usuario_id)
);

-- =====================================================
-- TRIGGER: criar perfil automaticamente ao cadastrar
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FUNÇÃO: tornar um usuário admin
-- Execute: SELECT tornar_admin('email_do_usuario@email.com');
-- =====================================================
CREATE OR REPLACE FUNCTION tornar_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE usuarios SET admin = true WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
