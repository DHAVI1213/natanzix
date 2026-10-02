import { useEffect, useRef, useState } from "react";
import type { LojaConfig } from "@/integrations/supabase/types";
import { scrollToId } from "@/lib/utils";

export default function LocationMap({ loja }: { loja: LojaConfig | null }) {
  const mapaRef = useRef<HTMLDivElement>(null);
  const [mapaOk, setMapaOk] = useState(false);
  const [pinoOn, setPinoOn] = useState(false);
  const secaoRef = useRef<HTMLElement>(null);

  const lat = loja?.latitude;
  const lng = loja?.longitude;
  const temCoordenadas = typeof lat === "number" && typeof lng === "number";
  const embedSrc = temCoordenadas
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=17&hl=pt-BR&output=embed`
    : null;
  const linkMapa = temCoordenadas
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
    : loja?.endereco
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loja.endereco)}`
    : "#";

  useEffect(() => {
    if (!embedSrc || !mapaRef.current) return;
    const el = mapaRef.current;
    const obs = new IntersectionObserver(
      (es, o) => {
        if (!es[0].isIntersecting || !navigator.onLine) return;
        o.disconnect();
        setMapaOk(true);
      },
      { rootMargin: "600px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [embedSrc]);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelado = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelado || !secaoRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      gsap.from(".mapa", {
        scale: 0.7,
        rotate: -20,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.6)",
        scrollTrigger: { trigger: secaoRef.current, start: "top 70%" },
      });
      gsap.from(".pino .gota", {
        y: -260,
        duration: 1.1,
        ease: "bounce.out",
        delay: 0.3,
        scrollTrigger: { trigger: secaoRef.current, start: "top 60%" },
        onComplete: () => setPinoOn(true),
      });
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <section className="onde" id="onde" ref={secaoRef} aria-labelledby="h-onde">
      <div className="grade">
        <div className="mapa" id="mapa" ref={mapaRef}>
          <svg className="ruas" viewBox="0 0 400 400" aria-hidden="true">
            <g fill="none" stroke="#1B1B1B" strokeLinecap="round">
              <path d="M-10 130 C 90 120 170 150 410 110" strokeWidth={14} stroke="#EF6F2E" />
              <path d="M-10 130 C 90 120 170 150 410 110" strokeWidth={2} />
              <path d="M120 -10 C 140 120 130 260 170 410" strokeWidth={10} stroke="#fff" />
              <path d="M120 -10 C 140 120 130 260 170 410" strokeWidth={2} />
              <path d="M-10 270 C 120 250 260 300 410 260" strokeWidth={10} stroke="#fff" />
              <path d="M-10 270 C 120 250 260 300 410 260" strokeWidth={2} />
              <path d="M290 -10 C 270 140 300 260 280 410" strokeWidth={10} stroke="#fff" />
              <path d="M290 -10 C 270 140 300 260 280 410" strokeWidth={2} />
              <path d="M20 40 L 380 360" strokeWidth={2} strokeDasharray="6 8" />
            </g>
            <g fill="#60A905" stroke="#1B1B1B" strokeWidth={2}>
              <circle cx={60} cy={200} r={22} />
              <circle cx={340} cy={330} r={26} />
              <circle cx={350} cy={50} r={16} />
            </g>
          </svg>
          {embedSrc ? (
            <iframe
              className={`mapa-real${mapaOk ? " ok" : ""}`}
              title="Mapa do Google com a localização do Frango no Pote"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              tabIndex={-1}
              src={mapaOk ? embedSrc : undefined}
            />
          ) : null}
          <span className="moldura" aria-hidden="true" />
          <span className="pulso" aria-hidden="true" />
          <span className="selo-mapa" aria-hidden="true">
            <i /> Google Maps
          </span>
          <button
            className={`pino${pinoOn ? " on" : ""}`}
            aria-label={`Frango no Pote, ${loja?.endereco || ""}`}
            onClick={() => setPinoOn((v) => !v)}
          >
            <span className="balao">
              <b>{loja?.nome?.split("—")[0]?.trim() || "Frango no Pote"}</b>
              <span>{loja?.endereco?.split(",").slice(0, 2).join(",") || "Centro · Formosa-GO"}</span>
            </span>
            <svg className="gota" viewBox="0 0 58 72" aria-hidden="true">
              <path
                d="M29 70 C 29 70 4 42 4 26 A25 25 0 0 1 54 26 C 54 42 29 70 29 70 Z"
                fill="#E3121B"
                stroke="#1B1B1B"
                strokeWidth={3}
              />
              <circle cx={29} cy={26} r={10} fill="#FFC614" stroke="#1B1B1B" strokeWidth={3} />
            </svg>
          </button>
        </div>
        <div>
          <p className="sub">onde fica</p>
          <h2 className="titulo" id="h-onde" style={{ color: "var(--vermelho)" }}>
            aqui no
            <br />
            centro
          </h2>
          <p className="endereco">{loja?.endereco || "Endereço em breve."}</p>
          <div className="acoes">
            <a
              className="btn vermelho"
              href="#cardapio"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("cardapio");
              }}
            >
              Ver cardápio <span className="seta">➜</span>
            </a>
            <a className="btn creme" href={linkMapa} target="_blank" rel="noopener noreferrer">
              Ver no mapa
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
