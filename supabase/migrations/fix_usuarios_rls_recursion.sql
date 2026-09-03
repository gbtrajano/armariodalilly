-- =====================================================
-- MIGRAÇÃO: Corrigir recursão infinita nas políticas RLS da tabela usuarios
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Criar função SECURITY DEFINER que verifica se o usuário é admin
--    Esta função roda fora do RLS (por causa do SECURITY DEFINER),
--    evitando a recursão infinita que ocorria quando as políticas
--    da tabela 'usuarios' faziam SELECT na própria tabela 'usuarios'.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid() AND admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Remover as políticas antigas que causavam recursão
DROP POLICY IF EXISTS "Admin pode inserir produtos" ON produtos;
DROP POLICY IF EXISTS "Admin pode atualizar produtos" ON produtos;
DROP POLICY IF EXISTS "Admin pode deletar produtos" ON produtos;
DROP POLICY IF EXISTS "Admin pode gerenciar tamanhos" ON produto_tamanhos;
DROP POLICY IF EXISTS "Admin pode gerenciar fotos" ON produto_fotos;
DROP POLICY IF EXISTS "Admin pode gerenciar promoções" ON promocoes_semana;
DROP POLICY IF EXISTS "Admin pode gerenciar promoção produtos" ON promocao_produtos;
DROP POLICY IF EXISTS "Admin vê todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Admin pode gerenciar usuários" ON usuarios;
DROP POLICY IF EXISTS "Admin vê todos os pedidos" ON pedidos;
DROP POLICY IF EXISTS "Admin pode atualizar pedidos" ON pedidos;
DROP POLICY IF EXISTS "Admin pode ver itens de qualquer pedido" ON pedido_itens;

-- 3. Recriar as políticas usando public.is_admin() em vez do subquery direto
-- Produtos
CREATE POLICY "Admin pode inserir produtos" ON produtos FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin pode atualizar produtos" ON produtos FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin pode deletar produtos" ON produtos FOR DELETE USING (public.is_admin());

-- Produto Tamanhos
CREATE POLICY "Admin pode gerenciar tamanhos" ON produto_tamanhos FOR ALL USING (public.is_admin());

-- Produto Fotos
CREATE POLICY "Admin pode gerenciar fotos" ON produto_fotos FOR ALL USING (public.is_admin());

-- Promoções
CREATE POLICY "Admin pode gerenciar promoções" ON promocoes_semana FOR ALL USING (public.is_admin());

-- Promoção Produtos
CREATE POLICY "Admin pode gerenciar promoção produtos" ON promocao_produtos FOR ALL USING (public.is_admin());

-- Usuários (estas eram as que causavam recursão!)
CREATE POLICY "Admin vê todos os usuários" ON usuarios FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin pode gerenciar usuários" ON usuarios FOR ALL USING (public.is_admin());

-- Pedidos
CREATE POLICY "Admin vê todos os pedidos" ON pedidos FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin pode atualizar pedidos" ON pedidos FOR UPDATE USING (public.is_admin());

-- Pedido Itens
CREATE POLICY "Admin pode ver itens de qualquer pedido" ON pedido_itens FOR SELECT USING (public.is_admin());
