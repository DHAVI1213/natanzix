import { useEffect, useRef } from "react";
import { scrollToId } from "@/lib/utils";
import { confete } from "@/components/efeitoConfete";
import Estrelas from "@/components/Estrelas";

export default function FinalCta() {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const secaoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelado = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelado || !secaoRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      gsap.from(".final h2", {
        y: -80,
        rotate: -6,
        opacity: 0,
        duration: 1,
        ease: "bounce.out",
        scrollTrigger: { trigger: secaoRef.current, start: "top 70%" },
      });
      gsap.from(".final .chamada, .final .btn", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.8)",
        scrollTrigger: { trigger: secaoRef.current, start: "top 55%" },
      });
      ScrollTrigger.create({
        trigger: secaoRef.current,
        start: "top 40%",
        once: true,
        onEnter: () => btnRef.current && confete(btnRef.current, 26),
      });
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <section className="final" ref={secaoRef} aria-labelledby="h-final">
      <h2 id="h-final">
        bateu a
        <br />
        fome?
      </h2>
      <p className="chamada">O pote tá esperando. Escolhe o seu no cardápio e o iFood leva até você.</p>
      <a
        className="btn"
        id="btnFinal"
        ref={btnRef}
        href="#cardapio"
        onClick={(e) => {
          e.preventDefault();
          scrollToId("cardapio");
        }}
      >
        Ver cardápio <span className="seta">➜</span>
      </a>
      <footer className="rodape">
        <span>Frango no Pote · Formosa-GO · Centro</span>
        <nav aria-label="Rodapé">
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("inicio");
            }}
          >
            Início
          </a>
          <a
            href="#cardapio"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("cardapio");
            }}
          >
            Cardápio
          </a>
          <a
            href="#como"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("como");
            }}
          >
            Como pedir
          </a>
          <a
            href="#onde"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("onde");
            }}
          >
            Onde
          </a>
        </nav>
        <span>Pedidos e pagamentos pelo iFood</span>
      </footer>
      <Estrelas posicoes={[["10%", "14%", 1.4], ["86%", "22%"], ["20%", "58%", 0.8], ["80%", "60%", 1.2]]} />
    </section>
  );
}
