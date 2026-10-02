import { useEffect, useRef } from "react";
import foto from "@/assets/pote-mesa.jpg";
import { scrollToId } from "@/lib/utils";

export default function TakeAway() {
  const quadroRef = useRef<HTMLDivElement>(null);
  const secaoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelado = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelado || !secaoRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      gsap.from(".quadro", {
        rotate: -14,
        scale: 0.8,
        opacity: 0,
        duration: 1.1,
        ease: "back.out(1.5)",
        scrollTrigger: { trigger: secaoRef.current, start: "top 70%" },
      });
      gsap.from(".viagem .adesivo", {
        scale: 0,
        rotate: 120,
        duration: 0.8,
        ease: "back.out(2.5)",
        stagger: 0.15,
        scrollTrigger: { trigger: secaoRef.current, start: "top 55%" },
      });
      gsap.from(".viagem .txt p, .viagem .txt .btn", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: { trigger: ".viagem .txt", start: "top 75%" },
      });
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <section className="viagem" ref={secaoRef} aria-labelledby="h-viagem">
      <div className="grade">
        <div className="foto-wrap">
          <div className="quadro" ref={quadroRef}>
            <img
              src={foto}
              alt="Pote preto do Frango no Pote cheio de frango empanado, sobre mesa de madeira, com três potinhos de molho ao lado"
              width={1280}
              height={854}
              loading="lazy"
            />
          </div>
          <span className="adesivo a" aria-hidden="true">
            feito
            <br />
            na hora
          </span>
          <span className="adesivo b" aria-hidden="true">
            Centro
            <br />
            Formosa
          </span>
        </div>
        <div className="txt">
          <p className="sub" style={{ color: "var(--tinta)" }}>
            pra viagem
          </p>
          <h2 className="titulo" id="h-viagem">
            do óleo
            <br />
            pro pote,
            <br />
            do pote
            <br />
            pra você
          </h2>
          <p>
            Empanado na hora do pedido, fechado no pote e entregue pelo iFood em Formosa. Chega do jeito que saiu da
            cozinha.
          </p>
          <a
            className="btn"
            href="#cardapio"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("cardapio");
            }}
          >
            Ver cardápio <span className="seta">➜</span>
          </a>
        </div>
      </div>
    </section>
  );
}
