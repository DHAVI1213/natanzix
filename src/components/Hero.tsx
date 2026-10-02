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

export default function Hero({ produtos, ifoodUrl }: { produtos: Produto[]; ifoodUrl: string | null }) {
  const destaques = useMemo(() => {
    const lista = produtos.filter((p) => p.destaque).slice(0, 5);
    return lista.map(montarDestaque);
  }, [produtos]);

  const [atual, setAtual] = useState(0);
  const barraRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);
  const heroiRef = useRef<HTMLDivElement>(null);
  const DURA = 6500;

  function irPara(i: number) {
    if (!destaques.length) return;
    setAtual(((i % destaques.length) + destaques.length) % destaques.length);
  }

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
    timerRef.current = window.setTimeout(() => irPara(atual + 1), DURA);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atual, destaques.length]);

  // arrastar no celular
  const toqueX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    toqueX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (toqueX.current === null) return;
    const d = e.changedTouches[0].clientX - toqueX.current;
    if (Math.abs(d) > 50) irPara(atual + (d < 0 ? 1 : -1));
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

  const d = destaques[atual];

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
      <div key={d.item.id} className="slide on">
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
            <span className="linha a">{d.l1}</span>
            <span className="linha b">{d.l2}</span>
          </h1>
          <p className="desc">{d.item.descricao}</p>
          <div className="acoes">
            <a
              className="btn"
              href={linkIfoodItem(ifoodUrl, d.item.ifood_item_id)}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={(e) => confete(e.currentTarget, 12)}
            >
              Pedir esse <span className="seta">➜</span>
            </a>
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
        <button className="btn creme seta-btn" aria-label="Destaque anterior" onClick={() => irPara(atual - 1)}>
          ‹
        </button>
        <div className="pilulas">
          {destaques.map((_, i) => (
            <button
              key={i}
              className={`pilula${i === atual ? " on" : ""}`}
              aria-label={`Ver ${destaques[i].item.nome}`}
              onClick={() => irPara(i)}
            >
              <i ref={i === atual ? barraRef : undefined} />
            </button>
          ))}
        </div>
        <button className="btn creme seta-btn" aria-label="Próximo destaque" onClick={() => irPara(atual + 1)}>
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
