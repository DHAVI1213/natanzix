const CORES = ["#FFC614", "#F5E3CD", "#60A905", "#EF6F2E"];

/**
 * Confete leve em CSS puro (sem depender de bibliotecas pesadas) disparado
 * ao passar o mouse nos botões principais — a mesma assinatura visual do
 * site original, só que mais simples para rodar bem no celular.
 */
export function confete(el: Element, n = 14) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  for (let i = 0; i < n; i++) {
    const p = document.createElement("span");
    p.className = "confete";
    const ang = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 90;
    const dx = Math.cos(ang) * dist;
    const dy = Math.sin(ang) * dist + 30;
    const rot = Math.random() * 360 - 180;
    p.style.left = `${cx}px`;
    p.style.top = `${cy}px`;
    p.style.background = CORES[i % CORES.length];
    p.style.zIndex = "95";
    p.style.transform = "translate(-50%,-50%) scale(0)";
    p.style.transition = "transform .7s cubic-bezier(.2,.8,.2,1), opacity .4s ease .35s";
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${rot}deg)`;
      p.style.opacity = "0";
    });
    setTimeout(() => p.remove(), 800);
  }
}
