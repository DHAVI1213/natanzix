import { useEffect, useRef } from "react";

/**
 * Bolinha que segue o mouse e cresce (virando "pedir") ao passar sobre
 * cards de produto, o pino do mapa ou o prato em destaque do herói.
 * Só aparece em telas com mouse de verdade (desktop).
 */
export default function CursorCoxinha() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    const el = ref.current;
    if (!el) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let raf = 0;

    function mover(e: PointerEvent) {
      x = e.clientX;
      y = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          if (el) el.style.transform = `translate(${x}px, ${y}px)`;
          raf = 0;
        });
      }
    }

    function sobre(e: MouseEvent) {
      const alvo = (e.target as HTMLElement)?.closest?.(".card, .pino, .prato");
      if (alvo) el?.classList.add("grande");
    }
    function fora(e: MouseEvent) {
      const alvo = (e.target as HTMLElement)?.closest?.(".card, .pino, .prato");
      if (alvo) el?.classList.remove("grande");
    }

    window.addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("mouseover", sobre);
    document.addEventListener("mouseout", fora);
    return () => {
      window.removeEventListener("pointermove", mover);
      document.removeEventListener("mouseover", sobre);
      document.removeEventListener("mouseout", fora);
    };
  }, []);

  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <b>pedir</b>
    </div>
  );
}
