export function brl(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduzido ? "auto" : "smooth" });
}

export function linkIfoodItem(ifoodUrl: string | null | undefined, itemId: string | null | undefined) {
  if (!ifoodUrl) return "#";
  if (!itemId) return ifoodUrl;
  return `${ifoodUrl}?prato=${itemId}`;
}

export function diaDaSemanaAtual(): string {
  const dias = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  return dias[new Date().getDay()];
}
