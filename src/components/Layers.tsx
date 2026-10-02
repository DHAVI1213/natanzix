import { useEffect, useRef } from "react";

const CAMADAS = [
  { ico: "🍗", n: "01", titulo: "o sassami", texto: "Filé de sassami, a parte mais macia do peito, cortado em pedaços ou em cubinhos no Croquinho." },
  { ico: "✨", n: "02", titulo: "a casquinha", texto: "Empanado crocante por fora, levemente picante, feito na hora do pedido." },
  { ico: "🥫", n: "03", titulo: "os molhos", texto: "Molho exclusivo da casa no pote. No Peito Médio são dois; no Grande, três." },
  { ico: "📦", n: "04", titulo: "o pote", texto: "Tudo vai fechado no pote, que segura a crocância até chegar na sua casa." },
];

export default function Layers() {
  const secaoRef = useRef<HTMLElement>(null);
  const pistaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelado = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelado || !secaoRef.current || !pistaRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();
      mm.add("(min-width: 901px)", () => {
        const pista = pistaRef.current!;
        const dist = () => Math.max(0, pista.scrollWidth - window.innerWidth);
        gsap.to(pista, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: secaoRef.current,
            start: "top top",
            end: () => "+=" + dist(),
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
      });
      mm.add("(max-width: 900px)", () => {
        gsap.from(".camada", {
          y: 60,
          opacity: 0,
          duration: 0.7,
          ease: "back.out(1.5)",
          stagger: 0.1,
          scrollTrigger: { trigger: pistaRef.current, start: "top 80%" },
        });
      });

      return () => mm.revert();
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <section className="camadas" id="camadas" ref={secaoRef} aria-labelledby="h-camadas">
      <div className="cab">
        <h2 className="titulo" id="h-camadas">
          pote por
          <br />
          dentro
        </h2>
        <p>Quatro coisas fazem o Frango no Pote ser o que é. Rola para ver cada uma.</p>
      </div>
      <div className="pista" ref={pistaRef}>
        {CAMADAS.map((c) => (
          <article className="camada" key={c.n}>
            <span className="ico" aria-hidden="true">
              {c.ico}
            </span>
            <span className="n">{c.n}</span>
            <div>
              <h3>{c.titulo}</h3>
              <p>{c.texto}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
