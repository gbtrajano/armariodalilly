export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function cn(...classes: Array<string | boolean | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
