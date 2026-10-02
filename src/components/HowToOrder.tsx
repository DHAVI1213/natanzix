import { useEffect, useRef } from "react";

const PASSOS = [
  { n: "1", titulo: "escolhe aqui", texto: "Navega pelo cardápio e toca no que deu vontade.", emoji: "👆" },
  { n: "2", titulo: "abre no iFood", texto: "O produto já abre no app, na loja de Formosa. É só escolher os molhos e confirmar.", emoji: "📱" },
  { n: "3", titulo: "chega quentinho", texto: "Sai da cozinha fechado no pote e vai direto para a sua porta.", emoji: "🛵" },
];

export default function HowToOrder() {
  const passosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelado = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelado || !passosRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const passos = passosRef.current.querySelectorAll(".passo");
      passos.forEach((p, i) => {
        if (i === passos.length - 1) return;
        gsap.to(p, {
          scale: 0.92,
          filter: "brightness(.85)",
          ease: "none",
          scrollTrigger: { trigger: passos[i + 1], start: "top bottom", end: "top 30%", scrub: true },
        });
      });
      gsap.from(".passo .emoji", {
        scale: 0,
        rotate: -40,
        duration: 0.6,
        ease: "back.out(3)",
        stagger: 0.2,
        scrollTrigger: { trigger: passosRef.current, start: "top 70%" },
      });
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <section className="como" id="como" aria-labelledby="h-como">
      <div className="cab">
        <p className="sub">é rapidinho</p>
        <h2 className="titulo" id="h-como">
          como pedir
        </h2>
      </div>
      <div className="passos" ref={passosRef}>
        {PASSOS.map((p) => (
          <article className="passo" key={p.n}>
            <span className="n">{p.n}</span>
            <div>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </div>
            <span className="emoji" aria-hidden="true">
              {p.emoji}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
