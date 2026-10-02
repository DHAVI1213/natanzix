import { useEffect, useState, type FormEvent } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Produto } from "@/integrations/supabase/types";
import { brl, linkIfoodItem } from "@/lib/utils";
import logo from "@/assets/logo-frango-no-pote.png";

export default function MyAccount() {
  const { user, perfil, carregando, sair, atualizarPerfil, backendConectado } = useAuth();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [favoritosProdutos, setFavoritosProdutos] = useState<Produto[]>([]);
  const [ifoodUrl, setIfoodUrl] = useState<string | null>(null);
  const [carregandoFavs, setCarregandoFavs] = useState(true);

  useEffect(() => {
    setNome(perfil?.nome || "");
    setTelefone(perfil?.telefone || "");
  }, [perfil]);

  useEffect(() => {
    if (!user || !backendConectado) {
      setCarregandoFavs(false);
      return;
    }
    (async () => {
      setCarregandoFavs(true);
      const [{ data: favs }, { data: loja }] = await Promise.all([
        supabase.from("favoritos").select("produto_id, produtos(*)").eq("user_id", user.id),
        supabase.from("loja_config").select("ifood_url").maybeSingle(),
      ]);
      setIfoodUrl((loja as { ifood_url?: string } | null)?.ifood_url ?? null);
      const produtos = (favs ?? [])
        .map((f: unknown) => (f as { produtos: Produto | null }).produtos)
        .filter((p): p is Produto => Boolean(p));
      setFavoritosProdutos(produtos);
      setCarregandoFavs(false);
    })();
  }, [user, backendConectado]);

  if (carregando) return null;
  if (!user) return <Navigate to="/entrar?depois=/minha-conta" replace />;

  async function onSalvar(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setMsg(null);
    const { erro } = await atualizarPerfil({ nome, telefone });
    setSalvando(false);
    setMsg(erro || "Dados salvos!");
  }

  return (
    <div className="tela-auth" style={{ alignItems: "flex-start" }}>
      <div className="cartao-auth" style={{ maxWidth: 560 }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <img src={logo} alt="Frango no Pote" width={64} height={64} style={{ borderRadius: "50%", border: "3px solid #1B1B1B", margin: "0 auto 10px", boxShadow: "3px 3px 0 #1B1B1B" }} />
          <h1 className="titulo" style={{ fontSize: "clamp(30px,6vw,46px)" }}>
            minha conta
          </h1>
        </div>

        {msg ? <div className={msg.includes("salvos") ? "ok-auth" : "erro-auth"}>{msg}</div> : null}

        <form onSubmit={onSalvar}>
          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" value={user.email ?? ""} disabled />
          </div>
          <div className="campo">
            <label htmlFor="nome">Nome</label>
            <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="telefone">Telefone</label>
            <input id="telefone" type="tel" placeholder="(61) 90000-0000" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </div>
          <button className="btn vermelho" type="submit" style={{ width: "100%" }} disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar dados"}
          </button>
        </form>

        <h2 className="sub" style={{ marginTop: 28, color: "var(--vermelho)" }}>
          meus favoritos
        </h2>
        {carregandoFavs ? (
          <p>Carregando…</p>
        ) : favoritosProdutos.length === 0 ? (
          <p style={{ fontSize: 14 }}>Você ainda não favoritou nenhum produto. Toque no coração ♡ de um item no cardápio.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {favoritosProdutos.map((p) => {
              const link = linkIfoodItem(ifoodUrl, p.ifood_item_id);
              return (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 10,
                    border: "3px solid var(--tinta)",
                    borderRadius: 16,
                    background: "#fff",
                    boxShadow: "3px 3px 0 var(--tinta)",
                  }}
                >
                  {p.imagem_url ? (
                    <img src={p.imagem_url} alt={p.nome} width={56} height={56} style={{ objectFit: "contain", flexShrink: 0 }} loading="lazy" />
                  ) : null}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: "block", fontSize: 15 }}>{p.nome}</strong>
                    <span style={{ fontSize: 13, color: "#555" }}>{brl(Number(p.preco))}</span>
                  </div>
                  {link ? (
                    <a className="btn peq" href={link} target="_blank" rel="noopener noreferrer">
                      Pedir
                    </a>
                  ) : (
                    <span className="btn peq" style={{ opacity: 0.5, pointerEvents: "none" }}>
                      Em breve
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 26, fontSize: 14, display: "grid", gap: 8 }}>
          <button className="btn creme" type="button" onClick={sair}>
            Sair da conta
          </button>
          <Link to="/">← Voltar para o site</Link>
        </div>
      </div>
    </div>
  );
}
