"use client";

import { useState } from "react";

interface Pergunta {
  pergunta: string;
  resposta: string;
}

const perguntas: Pergunta[] = [
  {
    pergunta: "Qual o prazo de entrega?",
    resposta:
      "O prazo de entrega varia de acordo com a sua região. Após a confirmação do pagamento, o envio é feito em até 3 dias úteis. O prazo de entrega pelos correios é de 3 a 10 dias úteis, dependendo da sua localidade.",
  },
  {
    pergunta: "Como faço para trocar ou devolver um produto?",
    resposta:
      "Você tem até 7 dias corridos após o recebimento para solicitar a troca ou devolução. O produto deve estar sem sinais de uso, com a etiqueta original e na embalagem intacta. Entre em contato pelo WhatsApp para iniciarmos o processo.",
  },
  {
    pergunta: "Quais formas de pagamento são aceitas?",
    resposta:
      "Aceitamos cartão de crédito (parcelado em até 6x), cartão de débito, PIX e boleto bancário. O PIX oferece 10% de desconto adicional!",
  },
  {
    pergunta: "Como rastrear meu pedido?",
    resposta:
      "Após o envio, você receberá um código de rastreio por e-mail e WhatsApp. Basta acessar o site dos Correios e inserir o código para acompanhar a entrega em tempo real.",
  },
  {
    pergunta: "As medidas estão certas no site?",
    resposta:
      "Sim! Cada produto possui um guia de medidas detalhado. Recomendamos conferir as medidas com uma peça similar que você já possua para garantir o caimento ideal. Em caso de dúvida, nosso time está disponível para ajudá-la.",
  },
  {
    pergunta: "Posso cancelar meu pedido?",
    resposta:
      "Pedidos podem ser cancelados até 24 horas após a confirmação, desde que ainda não tenham sido enviados. Após esse prazo, o processo de troca pode ser iniciado após o recebimento.",
  },
  {
    pergunta: "Vocês fazem entrega para todo o Brasil?",
    resposta:
      "Sim! Entregamos para todos os estados brasileiros. Para localidades mais remotas, o prazo pode ser um pouco maior, mas garantimos que seu pedido chegará com segurança.",
  },
];

export default function FAQPage() {
  const [aberta, setAberta] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-serif font-semibold text-neutral-900">
        Perguntas Frequentes
      </h1>
      <p className="mb-10 text-neutral-500">
        Encontre respostas para as dúvidas mais comuns sobre nossos produtos e serviços.
      </p>

      <div className="space-y-3">
        {perguntas.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-brand-100 bg-white"
          >
            <button
              onClick={() => setAberta(aberta === index ? null : index)}
              className="flex w-full items-center justify-between px-6 py-4 text-left font-medium text-neutral-800 transition hover:bg-brand-50/50"
            >
              <span>{item.pergunta}</span>
              <span className="ml-4 text-lg text-brand-500 transition-transform" style={{ transform: aberta === index ? "rotate(45deg)" : "rotate(0deg)" }}>
                +
              </span>
            </button>
            {aberta === index && (
              <div className="px-6 pb-4 text-neutral-600 leading-relaxed">
                {item.resposta}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
