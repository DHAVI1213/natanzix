import { useEffect, useRef } from "react";
import type { LojaConfig } from "@/integrations/supabase/types";

export default function Badges({ loja, totalProdutos }: { loja: LojaConfig | null; totalProdutos: number }) {
  const gradeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelado = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelado || !gradeRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      gsap.from(gradeRef.current.children, {
        y: 80,
        rotate: (i: number) => [-10, 8, -6, 10][i],
        opacity: 0,
        duration: 0.9,
        ease: "back.out(1.7)",
        stagger: 0.1,
        scrollTrigger: { trigger: gradeRef.current, start: "top 85%" },
      });
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const notaTxt = loja?.nota_ifood ? loja.nota_ifood.toString().replace(".", ",") : "4,9";
  const [seloA, seloB] = (loja?.selo_ifood || "Super Restaurante").split(" ");

  return (
    <section className="selos" aria-labelledby="h-selos">
      <p className="sub">por que pedir aqui</p>
      <h2 className="titulo" id="h-selos">
        nota de quem
        <br />
        já pediu
      </h2>
      <div className="grade" ref={gradeRef}>
        <div className="selo">
          <b>{notaTxt}</b>
          <span>no iFood</span>
          <p>Avaliação da loja de Formosa no app.</p>
        </div>
        <div className="selo">
          <b>{(seloA || "super").toLowerCase()}</b>
          <span>{(seloB || "restaurante").toLowerCase()}</span>
          <p>Selo que o iFood dá para lojas bem avaliadas e que entregam bem.</p>
        </div>
        <div className="selo">
          <b>3</b>
          <span>molhos no pote G</span>
          <p>O Peito Grande vem com 12 pedaços e três molhos da casa.</p>
        </div>
        <div className="selo">
          <b>{totalProdutos || 42}</b>
          <span>opções</span>
          <p>Potes, burgers, porções, combos, sobremesas e bebidas.</p>
        </div>
      </div>
    </section>
  );
}
