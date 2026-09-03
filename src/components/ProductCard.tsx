import Image from "next/image";
import Link from "next/link";
import { Produto } from "@/lib/types";
import { formatarPreco } from "@/lib/utils";

export default function ProductCard({ produto }: { produto: Produto }) {
  const temPromocao = !!produto.precoPromocional;

  return (
    <Link
      href={`/produtos/${produto.slug}`}
      className="group block overflow-hidden rounded-2xl border border-neutral-100 bg-white transition hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-50">
        <Image
          src={produto.imagem}
          alt={produto.nome}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {temPromocao && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
            Oferta
          </span>
        )}
      </div>

      <div className="space-y-1 p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-400">{produto.categoria}</p>
        <h3 className="font-medium text-neutral-800">{produto.nome}</h3>
        <div className="flex items-baseline gap-2">
          {temPromocao ? (
            <>
              <span className="text-sm text-neutral-400 line-through">
                {formatarPreco(produto.preco)}
              </span>
              <span className="font-semibold text-brand-700">
                {formatarPreco(produto.precoPromocional!)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-brand-700">{formatarPreco(produto.preco)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
