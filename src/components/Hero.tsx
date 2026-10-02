import { useEffect, useMemo, useRef, useState } from "react";
import type { Produto } from "@/integrations/supabase/types";
import { brl, linkIfoodItem, scrollToId } from "@/lib/utils";
import { confete } from "@/components/efeitoConfete";
import Estrelas from "@/components/Estrelas";

interface Destaque {
  item: Produto;
  cor: string;
  l1: string;
  l2: string;
  tag: string;
}

const CONHECIDOS: Record<string, { l1: string; l2: string; tag: string; cor: string }> = {
  "Peito Grande": { l1: "peito", l2: "grande", tag: "o campeão da casa", cor: "#E3121B" },
  "Croquinho Supremo": { l1: "croquinho", l2: "supremo", tag: "cubinhos com 2 molhos", cor: "#EF6F2E" },
  "Fnp Caramelo": { l1: "fnp", l2: "caramelo", tag: "o burger da casa", cor: "#4C0016" },
};
const CORES_PADRAO = ["#E3121B", "#EF6F2E", "#4C0016"];

function montarDestaque(p: Produto, i: number): Destaque {
  const conhecido = CONHECIDOS[p.nome];
  if (conhecido) return { item: p, ...conhecido };
  const palavras = p.nome.split(" ");
  const meio = Math.max(1, Math.ceil(palavras.length / 2));
  return {
    item: p,
    cor: CORES_PADRAO[i % CORES_PADRAO.length],
    l1: palavras.slice(0, meio).join(" "),
    l2: palavras.slice(meio).join(" ") || "no pote",
    tag: "destaque da casa",
  };
}

/** Quebra um texto em spans por letra (classe .l), igual ao modelo original — é o que permite animar letra a letra na troca de slide. */
function renderLetras(texto: string) {
  return [...texto].map((c, i) => (
    <span className="l" key={i}>
      {c === " " ? " " : c}
    </span>
  ));
}

export default function Hero({ produtos, ifoodUrl }: { produtos: Produto[]; ifoodUrl: string | null }) {
  const destaques = useMemo(() => {
    const lista = produtos.filter((p) => p.destaque).slice(0, 5);
    return lista.map(montarDestaque);
  }, [produtos]);

  const [mostrado, setMostrado] = useState(0);
  const barraRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);
  const heroiRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const ondaRef = useRef<HTMLDivElement>(null);
  const trocandoRef = useRef(false);
  const primeiraRenderRef = useRef(true);
  const DURA = 6500;

  function irPara(i: number, origem?: "prox" | "ant") {
    if (!destaques.length || trocandoRef.current) return;
    const de = mostrado;
    const vai = ((i % destaques.length) + destaques.length) % destaques.length;
    if (vai === de) return;
    const frente = origem ? origem === "prox" : vai > de;
    trocar(vai, frente);
  }

  // troca de destaque com a mesma coreografia do modelo: letras e bolha saem,
  // uma onda da cor nova se abre a partir da bolha, e a letras/bolha do
  // próximo destaque entram quicando. Sem GSAP (ou com "reduzir movimento"),
  // troca direto, sem efeito.
  async function trocar(vai: number, frente: boolean) {
    const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heroi = heroiRef.current;
    const sai = slideRef.current;
    const onda = ondaRef.current;
    const corNova = destaques[vai].cor;

    if (!heroi || !sai || !onda || calmo) {
      setMostrado(vai);
      return;
    }

    const gsapMod = await import("gsap").catch(() => null);
    const gsap = gsapMod?.gsap ?? gsapMod?.default;
    if (!gsap) {
      setMostrado(vai);
      return;
    }

    trocandoRef.current = true;
    const liberar = () => {
      trocandoRef.current = false;
    };
    // trava de segurança: nunca deixa o carrossel travado se algo falhar
    const seguranca = window.setTimeout(liberar, 2500);

    const bolha = sai.querySelector(".bolha");
    const letrasEl = sai.querySelectorAll(".l");
    const resto = sai.querySelectorAll(".etiqueta, .desc, .acoes");

    let cx = "80%";
    let cy = "50%";
    if (bolha) {
      const b = bolha.getBoundingClientRect();
      const h = heroi.getBoundingClientRect();
      if (h.width && h.height) {
        cx = (((b.left + b.width / 2 - h.left) / h.width) * 100).toFixed(1) + "%";
        cy = (((b.top + b.height / 2 - h.top) / h.height) * 100).toFixed(1) + "%";
      }
    }
    onda.style.background = corNova;

    const tl = gsap.timeline({
      onComplete: () => {
        window.clearTimeout(seguranca);
        liberar();
      },
    });

    tl.to(letrasEl, { yPercent: frente ? -120 : 120, rotate: () => gsap.utils.random(-25, 25), opacity: 0, duration: 0.35, ease: "power2.in", stagger: 0.015 }, 0);
    tl.to(resto, { y: -16, opacity: 0, duration: 0.3, ease: "power2.in", stagger: 0.04 }, 0);
    if (bolha) tl.to(bolha, { scale: 0.6, rotate: frente ? -40 : 40, opacity: 0, duration: 0.45, ease: "back.in(1.6)" }, 0);
    tl.fromTo(onda, { clipPath: `circle(0% at ${cx} ${cy})` }, { clipPath: `circle(150% at ${cx} ${cy})`, duration: 0.8, ease: "power3.inOut" }, 0.15);
    tl.add(() => {
      heroi.style.setProperty("--cor", corNova);
      gsap.set(onda, { clipPath: `circle(0% at ${cx} ${cy})` });
      setMostrado(vai);
    });
  }

  // entrada do destaque novo, depois que o React já trocou o conteúdo do slide
  useEffect(() => {
    if (primeiraRenderRef.current) {
      primeiraRenderRef.current = false;
      return;
    }
    if (!trocandoRef.current) return; // troca "instantânea" (sem gsap / reduced motion): nada a animar
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelado = false;
    (async () => {
      const gsapMod = await import("gsap").catch(() => null);
      const gsap = gsapMod?.gsap ?? gsapMod?.default;
      if (cancelado || !gsap || !slideRef.current) return;
      const entra = slideRef.current;
      const bolha = entra.querySelector(".bolha");
      const letrasEl = entra.querySelectorAll(".l");
      const resto = entra.querySelectorAll(".etiqueta, .desc, .acoes");

      if (bolha) {
        gsap.fromTo(bolha, { scale: 0.5, rotate: 50, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.9, ease: "back.out(1.7)" });
      }
      gsap.fromTo(
        letrasEl,
        { yPercent: 120, rotate: () => gsap.utils.random(-30, 30), opacity: 0 },
        { yPercent: 0, rotate: 0, opacity: 1, duration: 0.7, ease: "back.out(2.2)", stagger: 0.03, delay: 0.1 }
      );
      gsap.fromTo(resto, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.07, delay: 0.2 });
    })();
    return () => {
      cancelado = true;
    };
  }, [mostrado]);

  useEffect(() => {
    if (!destaques.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (barraRef.current) {
      barraRef.current.style.transition = "none";
      barraRef.current.style.width = "0%";
      requestAnimationFrame(() => {
        if (!barraRef.current) return;
        barraRef.current.style.transition = `width ${DURA}ms linear`;
        barraRef.current.style.width = "100%";
      });
    }
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => irPara(mostrado + 1, "prox"), DURA);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrado, destaques.length]);

  // arrastar no celular
  const toqueX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    toqueX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (toqueX.current === null) return;
    const d = e.changedTouches[0].clientX - toqueX.current;
    if (Math.abs(d) > 50) irPara(mostrado + (d < 0 ? 1 : -1), d < 0 ? "prox" : "ant");
    toqueX.current = null;
  }

  if (!destaques.length) {
    return (
      <section className="heroi" id="inicio" style={{ ["--cor" as string]: "#4C0016" }}>
        <div className="texto" style={{ position: "relative", top: "auto", transform: "none", paddingTop: "40svh" }}>
          <h1>
            <span className="linha">frango</span>
            <span className="linha b">no pote</span>
          </h1>
          <p className="desc">O cardápio está sendo preparado. Volte em instantes.</p>
        </div>
      </section>
    );
  }

  const d = destaques[mostrado];

  return (
    <section
      className="heroi"
      id="inicio"
      ref={heroiRef}
      style={{ ["--cor" as string]: d.cor }}
      aria-roledescription="carrossel"
      aria-label="Destaques da casa"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="onda" ref={ondaRef} aria-hidden="true" />
      <div className="slide on" ref={slideRef}>
        <div className="bolha">
          <span className="giro" />
          <span className="fundo" />
          {d.item.imagem_url ? (
            <img className="prato" src={d.item.imagem_url} alt={d.item.nome} fetchPriority="high" />
          ) : null}
          <span className="preco">
            <span>
              {d.item.a_partir_de ? <small>a partir de</small> : null}
              {brl(Number(d.item.preco))}
            </span>
          </span>
        </div>
        <div className="texto">
          <span className="etiqueta">
            <i /> {d.tag}
          </span>
          <h1 aria-label={d.item.nome}>
            <span className="linha a" aria-hidden="true">
              {renderLetras(d.l1)}
            </span>
            <span className="linha b" aria-hidden="true">
              {renderLetras(d.l2)}
            </span>
          </h1>
          <p className="desc">{d.item.descricao}</p>
          <div className="acoes">
            {(() => {
              const linkDestaque = linkIfoodItem(ifoodUrl, d.item.ifood_item_id);
              return linkDestaque ? (
                <a
                  className="btn"
                  href={linkDestaque}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={(e) => confete(e.currentTarget, 12)}
                >
                  Pedir esse <span className="seta">➜</span>
                </a>
              ) : null;
            })()}
            <a
              className="btn creme"
              href="#cardapio"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("cardapio");
              }}
            >
              Ver cardápio
            </a>
          </div>
        </div>
      </div>
      <div className="controles">
        <button className="btn creme seta-btn" aria-label="Destaque anterior" onClick={() => irPara(mostrado - 1, "ant")}>
          ‹
        </button>
        <div className="pilulas">
          {destaques.map((_, i) => (
            <button
              key={i}
              className={`pilula${i === mostrado ? " on" : ""}`}
              aria-label={`Ver ${destaques[i].item.nome}`}
              onClick={() => irPara(i)}
            >
              <i ref={i === mostrado ? barraRef : undefined} />
            </button>
          ))}
        </div>
        <button className="btn creme seta-btn" aria-label="Próximo destaque" onClick={() => irPara(mostrado + 1, "prox")}>
          ›
        </button>
      </div>
      <a
        className="rolar"
        href="#pilha"
        onClick={(e) => {
          e.preventDefault();
          scrollToId("pilha");
        }}
      >
        rola pra baixo <span>↓</span>
      </a>
      <Estrelas posicoes={[["48%", "14%", 1.2], ["8%", "18%"], ["92%", "82%", 0.8], ["56%", "78%", 0.7]]} />
    </section>
  );
}
