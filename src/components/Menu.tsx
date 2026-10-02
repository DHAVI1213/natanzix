import { useMemo, useState } from "react";
import type { Categoria, Produto } from "@/integrations/supabase/types";
import ProductCard from "@/components/ProductCard";

interface Props {
  categorias: Categoria[];
  produtos: Produto[];
  ifoodUrl: string | null;
  favoritos: Set<string>;
  onAlternarFavorito: (id: string) => void;
  erro: string | null;
  carregando: boolean;
}

export default function Menu({ categorias, produtos, ifoodUrl, favoritos, onAlternarFavorito, erro, carregando }: Props) {
  const categoriasComItens = useMemo(
    () => categorias.filter((c) => produtos.some((p) => p.categoria_id === c.id)),
    [categorias, produtos]
  );
  const [abaAtual, setAbaAtual] = useState(0);
  const categoriaAtiva = categoriasComItens[abaAtual];
  const itensDaAba = useMemo(
    () => (categoriaAtiva ? produtos.filter((p) => p.categoria_id === categoriaAtiva.id) : []),
    [produtos, categoriaAtiva]
  );

  return (
    <section className="cardapio" id="cardapio" aria-labelledby="h-cardapio">
      <div className="cab">
        <div>
          <p className="sub">cardápio completo</p>
          <h2 className="titulo" id="h-cardapio">
            escolhe
            <br />o seu
          </h2>
        </div>
        <p>Toque em qualquer produto e ele abre direto no iFood da loja, já no item certo.</p>
      </div>

      {erro ? (
        <p style={{ padding: "0 clamp(16px,5vw,80px)" }}>
          Não foi possível carregar o cardápio agora. {erro.includes("conectado") ? erro : "Tente novamente em instantes."}
        </p>
      ) : carregando ? (
        <p style={{ padding: "0 clamp(16px,5vw,80px)" }}>Carregando cardápio…</p>
      ) : categoriasComItens.length === 0 ? (
        <p style={{ padding: "0 clamp(16px,5vw,80px)" }}>Nenhum produto cadastrado ainda.</p>
      ) : (
        <>
          <div className="abas" role="tablist" aria-label="Categorias">
            {categoriasComItens.map((c, i) => (
              <button
                key={c.id}
                className="aba"
                role="tab"
                id={`aba${i}`}
                aria-selected={i === abaAtual}
                aria-controls="itens"
                onClick={(e) => {
                  setAbaAtual(i);
                  (e.currentTarget as HTMLElement).scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
                }}
              >
                {c.nome}
              </button>
            ))}
          </div>
          <div className="grade-itens" id="itens" role="tabpanel" aria-live="polite" aria-labelledby={`aba${abaAtual}`} key={categoriaAtiva?.id}>
            {itensDaAba.map((p, i) => (
              <ProductCard
                key={p.id}
                produto={p}
                index={i}
                ifoodUrl={ifoodUrl}
                favorito={favoritos.has(p.id)}
                onAlternarFavorito={onAlternarFavorito}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
