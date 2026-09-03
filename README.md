# Ateliê — E-commerce de Moda Feminina

Projeto inicial de e-commerce construído com **Next.js (App Router) + TypeScript + Tailwind CSS**,
seguindo a arquitetura sugerida: frontend em Next.js, carrinho persistente com Zustand,
cálculo de frete via API Route (pronta para integrar Melhor Envio/Frenet) e estrutura para
webhooks de pagamento (Mercado Pago/Asaas/Pagar.me) e logística reversa (trocas/devoluções).

## Como rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Estrutura do projeto

```
src/
  app/
    page.tsx                     # Home
    produtos/page.tsx            # Listagem (com filtro ?categoria=)
    produtos/[slug]/page.tsx     # Detalhe do produto
    carrinho/page.tsx            # Página completa do carrinho
    checkout/page.tsx            # Formulário de finalização de compra
    api/
      frete/route.ts             # Cálculo de frete (mock -> plugar Melhor Envio/Frenet)
      pagamento/webhook/route.ts # Webhook do gateway de pagamento
      devolucao/route.ts         # Solicitação de troca/devolução (logística reversa)
  components/                    # Header, Footer, ProductCard, CartDrawer, SizeGuideModal, CepCalculator
  store/cartStore.ts             # Carrinho com Zustand + persist (localStorage)
  lib/                           # Tipos, dados mock e utilitários
```

## O que já está pronto

- Catálogo de produtos com dados mock (`src/lib/mockData.ts`) — troque por consultas ao Supabase.
- Carrinho persistente entre sessões via `localStorage` (Zustand `persist`).
- Cálculo de frete por CEP consumindo `/api/frete` (hoje simulado, comentários no código mostram
  exatamente onde plugar a API real do Melhor Envio ou Frenet).
- Tabela de medidas interativa (modal com abas P/M/G) no componente `SizeGuideModal`.
- Imagens otimizadas com `next/image` (AVIF/WebP automático).
- Estrutura de checkout e stubs de webhook de pagamento e de devolução, prontos para receber
  a integração real com o gateway e a transportadora escolhidos.

## Próximos passos sugeridos

1. **Banco de dados real**: criar tabelas de produtos, pedidos, usuários e estoque no Supabase
   e substituir `src/lib/mockData.ts` por Server Components que consultam o banco.
2. **Pagamento**: integrar Mercado Pago/Asaas/Pagar.me no fluxo de `checkout/page.tsx`, gerando
   a cobrança Pix/cartão e redirecionando a cliente para a confirmação.
3. **Frete real**: em `src/app/api/frete/route.ts`, substituir o mock pela chamada real à API
   do Melhor Envio ou Frenet (o comentário no arquivo já mostra o payload esperado).
4. **Autenticação**: adicionar login da cliente (Supabase Auth) para a área "Minha conta" e
   histórico de pedidos.
5. **Painel administrativo**: tela interna para gestão de produtos, estoque e pedidos.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com suas credenciais reais antes de integrar
os serviços de pagamento, frete e banco de dados.
