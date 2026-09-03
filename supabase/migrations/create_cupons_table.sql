-- =====================================================
-- MIGRAÇÃO: Criar tabela de cupons
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Criar tabela de cupons
CREATE TABLE IF NOT EXISTS cupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  descricao TEXT,
  desconto_percentual INTEGER CHECK (desconto_percentual BETWEEN 1 AND 100),
  desconto_fixo DECIMAL(10,2) CHECK (desconto_fixo > 0),
  valor_minimo DECIMAL(10,2) DEFAULT 0,
  uso_maximo INTEGER DEFAULT 1,
  uso_atual INTEGER DEFAULT 0,
  data_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_fim TIMESTAMPTZ NOT NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_cupons_codigo ON cupons(codigo);
CREATE INDEX IF NOT EXISTS idx_cupons_ativo ON cupons(ativo);

-- 3. RLS
ALTER TABLE cupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cupons ativos para leitura" ON cupons FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar cupons" ON cupons FOR ALL USING (public.is_admin());

-- 4. Função para incrementar uso do cupom
CREATE OR REPLACE FUNCTION incrementar_uso_cupom(p_codigo TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE cupons SET uso_atual = uso_atual + 1 WHERE codigo = p_codigo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
