import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-brand-100 bg-brand-50/50">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-600">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-2 font-semibold text-brand-700">Armário da Lilly</h3>
            <p>Moda feminina com curadoria própria. Peças selecionadas com carinho para valorizar o seu estilo.</p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-brand-700">Ajuda</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/faq" className="transition hover:text-brand-600">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link href="/trocas-e-devolucoes" className="transition hover:text-brand-600">
                  Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition hover:text-brand-600">
                  Rastreio de Pedido
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-brand-700">Legal</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/politica-de-privacidade" className="transition hover:text-brand-600">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos-de-uso" className="transition hover:text-brand-600">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/trocas-e-devolucoes" className="transition hover:text-brand-600">
                  Política de Trocas
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-brand-700">Contato</h3>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/SEU_PERFIL"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 transition hover:text-pink-500"
                aria-label="Instagram"
              >
                <i className="fa-brands fa-instagram text-xl"></i>
              </a>
              <a
                href="mailto:contato@armariodalilly.com.br"
                className="text-neutral-500 transition hover:text-brand-600"
                aria-label="E-mail"
              >
                <i className="fa-solid fa-envelope text-xl"></i>
              </a>
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-neutral-400">
          &copy; {new Date().getFullYear()} Armário da Lilly. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
