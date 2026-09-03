export default function TrocasEDevolucoesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-neutral-700">
      <h1 className="mb-8 text-3xl font-serif font-semibold text-neutral-900">
        Política de Trocas e Devoluções
      </h1>

      <div className="space-y-6 leading-relaxed">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-800">1. Prazo para Trocas e Devoluções</h2>
          <p>
            Você tem até <strong>7 dias corridos</strong> após o recebimento do produto
            para solicitar a troca ou devolução, conforme previsto no Código de Defesa
            do Consumidor (Art. 49).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-800">2. Condições do Produto</h2>
          <p>
            Para que a troca ou devolução seja aceita, o produto deve estar:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Sem sinais de uso, lavagem ou alteredas</li>
            <li>Com todas as etiquetas originais fixadas</li>
            <li>Na embalagem original</li>
            <li>Acompanhado da nota fiscal</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-800">3. Como Solicitar</h2>
          <p>
            Para iniciar o processo, entre em contato conosco pelo WhatsApp ou
            e-mail, informando o número do pedido, o motivo da troca ou devolução
            e fotos do produto. Analisaremos sua solicitação em até 2 dias úteis.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-800">4. Frete de Devolução</h2>
          <p>
            Em caso de arrependimento (produto sem defeito), o frete de devolução
            será por conta do cliente. Se o produto apresentar defeito de fabricação,
            o frete será integralmente custeado por nós.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-800">5. Reembolso</h2>
          <p>
            Após a aprovação da devolução, o reembolso será processado em até
            10 dias úteis, utilizando o mesmo método de pagamento da compra original.
            No caso de PIX ou cartão de débito, o valor será transferido para a
            conta indicada pelo cliente.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-800">6. Troca por Tamanho</h2>
          <p>
            Caso o produto não fique do jeito que você esperava, a primeira troca
            por tamanho diferente é por nossa conta! Aproveite para encontrar
            o caimento perfeito.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-800">7. Produtos com Defeito</h2>
          <p>
            Se você recebeu um produto com defeito de fabricação, entre em contato
            imediatamente. Nossa equipe analisará o caso e providenciará a troca
            ou devolução com toda a agilidade possível.
          </p>
        </section>
      </div>
    </div>
  );
}
