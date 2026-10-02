import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "@/assets/logo-frango-no-pote.png";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { entrar, entrarComGoogle, backendConectado } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const depois = params.get("depois") || "/minha-conta";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const { erro } = await entrar(email, senha);
    setEnviando(false);
    if (erro) setErro(erro);
    else navigate(depois);
  }

  async function onGoogle() {
    setErro(null);
    const { erro } = await entrarComGoogle();
    if (erro) setErro(erro);
  }

  return (
    <div className="tela-auth">
      <div className="cartao-auth">
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <img src={logo} alt="Frango no Pote" width={64} height={64} style={{ borderRadius: "50%", border: "3px solid #1B1B1B", margin: "0 auto 10px", boxShadow: "3px 3px 0 #1B1B1B" }} />
          <h1 className="titulo" style={{ fontSize: "clamp(32px,6vw,48px)" }}>
            entrar
          </h1>
        </div>

        {!backendConectado ? (
          <div className="erro-auth">
            O login ainda não funciona porque o backend (Lovable Cloud) não está conectado a este projeto.
          </div>
        ) : null}
        {erro ? <div className="erro-auth">{erro}</div> : null}

        <form onSubmit={onSubmit}>
          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input id="senha" type="password" required autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <button className="btn vermelho" type="submit" style={{ width: "100%" }} disabled={enviando || !backendConectado}>
            {enviando ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <button className="btn creme" type="button" style={{ width: "100%", marginTop: 14 }} onClick={onGoogle} disabled={!backendConectado}>
          Entrar com Google
        </button>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, display: "grid", gap: 8 }}>
          <Link to="/recuperar-senha">Esqueci minha senha</Link>
          <span>
            Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
          </span>
          <Link to="/">← Voltar para o site</Link>
        </div>
      </div>
    </div>
  );
}
