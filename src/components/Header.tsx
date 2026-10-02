import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/logo-frango-no-pote.png";
import { scrollToId } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const [cheio, setCheio] = useState(false);
  const [aberta, setAberta] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function onScroll() {
      setCheio(window.scrollY > window.innerHeight * 0.8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAberta(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function irParaCardapio(e: React.MouseEvent) {
    e.preventDefault();
    setAberta(false);
    const home = window.location.pathname === "/";
    if (home) {
      scrollToId("cardapio");
    } else {
      navigate("/#cardapio");
    }
  }

  return (
    <>
      <header className={`topo${cheio ? " cheio" : ""}`} id="topo">
        <nav aria-label="Seções">
          <a href="#cardapio" onClick={irParaCardapio}>
            Cardápio
          </a>
          <a href="#como" onClick={(e) => { e.preventDefault(); scrollToId("como"); }}>
            Como pedir
          </a>
          <a href="#onde" onClick={(e) => { e.preventDefault(); scrollToId("onde"); }}>
            Onde
          </a>
          <Link to={user ? "/minha-conta" : "/entrar"}>{user ? "Minha conta" : "Entrar"}</Link>
        </nav>
        <Link className="marca" to="/" aria-label="Frango no Pote, início">
          <img src={logo} alt="" width={52} height={52} />
          <span>frango no pote</span>
        </Link>
        <div className="lado">
          <a className="btn peq" href="#cardapio" onClick={irParaCardapio}>
            Cardápio
          </a>
          <button className="hamb" aria-expanded={aberta} aria-controls="gaveta" onClick={() => setAberta((v) => !v)}>
            {aberta ? "Fechar" : "Menu"}
          </button>
        </div>
      </header>
      <div className={`gaveta${aberta ? " aberta" : ""}`} id="gaveta">
        <ul>
          <li>
            <a href="#cardapio" onClick={irParaCardapio}>
              Cardápio
            </a>
          </li>
          <li>
            <a href="#como" onClick={(e) => { e.preventDefault(); setAberta(false); scrollToId("como"); }}>
              Como pedir
            </a>
          </li>
          <li>
            <a href="#onde" onClick={(e) => { e.preventDefault(); setAberta(false); scrollToId("onde"); }}>
              Onde fica
            </a>
          </li>
          <li>
            <Link to={user ? "/minha-conta" : "/entrar"} onClick={() => setAberta(false)}>
              {user ? "Minha conta" : "Entrar"}
            </Link>
          </li>
          {isAdmin ? (
            <li>
              <Link to="/admin" onClick={() => setAberta(false)}>
                Painel
              </Link>
            </li>
          ) : null}
        </ul>
      </div>
    </>
  );
}
