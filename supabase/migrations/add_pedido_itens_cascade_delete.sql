-- =====================================================
-- MIGRAÇÃO: Adicionar ON DELETE CASCADE na foreign key de pedido_itens.produto_id
-- Isso permite deletar produtos que possuem itens de pedido associados
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Remover a foreign key constraint existente
ALTER TABLE pedido_itens
  DROP CONSTRAINT IF EXISTS pedido_itens_produto_id_fkey;

-- 2. Recriar com ON DELETE CASCADE
ALTER TABLE pedido_itens
  ADD CONSTRAINT pedido_itens_produto_id_fkey
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE;
