import { useEffect, useRef } from "react";
import { scrollToId } from "@/lib/utils";
import { confete } from "@/components/efeitoConfete";
import Estrelas from "@/components/Estrelas";

const PALAVRAS = ["crocante", "macio", "picantinho", "no pote"];

export default function StackedWords() {
  const secaoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: { revert: () => void } | null = null;
    let cancelado = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelado || !secaoRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const palavras = secaoRef.current!.querySelectorAll(".palavra");
        gsap.set(palavras, { scale: 0, rotate: (i: number) => [-8, 6, -5, 7][i] });
        gsap.set(".rodape-pilha", { y: 40, opacity: 0 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: secaoRef.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
        });
        palavras.forEach((p, i) => {
          tl.to(p, { scale: 1, rotate: [-3, 2, -2, 3][i], duration: 1, ease: "back.out(2.4)" }, i * 0.9);
        });
        tl.to(".rodape-pilha", { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, ">-0.2");
        gsap.from(".pilha .sobre", {
          y: 30,
          opacity: 0,
          duration: 0.6,
          scrollTrigger: { trigger: secaoRef.current, start: "top 70%" },
        });
      }, secaoRef);
    })();

    return () => {
      cancelado = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section className="pilha" id="pilha" ref={secaoRef} aria-label="Como é o nosso frango">
      <div className="palco">
        <p className="sobre">o que chega na sua mão</p>
        <h2 className="palavras">
          {PALAVRAS.map((p) => (
            <span className="palavra" key={p}>
              {p}
            </span>
          ))}
        </h2>
        <div className="rodape-pilha">
          <p>
            Filé de sassami empanado, crocante por fora, macio por dentro e levemente picante, com os molhos da casa
            direto no pote.
          </p>
          <a
            className="btn vermelho"
            href="#cardapio"
            onClick={(e) => {
              e.preventDefault();
              confete(e.currentTarget, 12);
              scrollToId("cardapio");
            }}
          >
            Quero o meu <span className="seta">➜</span>
          </a>
        </div>
        <Estrelas posicoes={[["14%", "24%", 1.3], ["84%", "30%"], ["10%", "72%", 0.8], ["88%", "74%", 1.1]]} />
      </div>
    </section>
  );
}
