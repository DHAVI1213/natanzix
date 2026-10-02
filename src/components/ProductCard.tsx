import { useNavigate } from "react-router-dom";
import type { Produto } from "@/integrations/supabase/types";
import { brl, linkIfoodItem } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  produto: Produto;
  ifoodUrl: string | null;
  favorito: boolean;
  onAlternarFavorito: (id: string) => void;
  index?: number;
}

export default function ProductCard({ produto, ifoodUrl, favorito, onAlternarFavorito, index = 0 }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  function cliqueCoracao(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate(`/entrar?depois=${encodeURIComponent(window.location.pathname + "#cardapio")}`);
      return;
    }
    onAlternarFavorito(produto.id);
  }

  return (
    <a
      className="card"
      style={{ ["--i" as string]: index }}
      href={linkIfoodItem(ifoodUrl, produto.ifood_item_id)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${produto.nome}, ${produto.a_partir_de ? "a partir de " : ""}${brl(Number(produto.preco))}, pedir no iFood`}
    >
      <div className="foto">
        {produto.a_partir_de ? <span className="tag">monte o seu</span> : null}
        <button
          type="button"
          className={`coracao${favorito ? " on" : ""}`}
          aria-label={favorito ? "Remover dos favoritos" : "Favoritar"}
          onClick={cliqueCoracao}
        >
          {favorito ? "♥" : "♡"}
        </button>
        {produto.imagem_url ? (
          <img src={produto.imagem_url} alt={produto.nome} loading="lazy" width={320} height={240} />
        ) : null}
      </div>
      <div className="corpo">
        <h3>{produto.nome}</h3>
        <p>{produto.descricao || ""}</p>
        <div className="pe">
          <span className="valor">
            {produto.a_partir_de ? <small>a partir de</small> : null}
            {brl(Number(produto.preco))}
          </span>
          <span className="ir">Pedir ➜</span>
        </div>
      </div>
    </a>
  );
}
