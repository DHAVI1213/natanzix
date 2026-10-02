import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-frango-no-pote.png";
import { useAuth } from "@/hooks/useAuth";

export default function Signup() {
  const { cadastrar, entrarComGoogle, backendConectado } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const { erro } = await cadastrar(email, senha, nome);
    setEnviando(false);
    if (erro) setErro(erro);
    else setOk(true);
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
            cadastro
          </h1>
        </div>

        {!backendConectado ? (
          <div className="erro-auth">
            O cadastro ainda não funciona porque o backend (Lovable Cloud) não está conectado a este projeto.
          </div>
        ) : null}
        {erro ? <div className="erro-auth">{erro}</div> : null}
        {ok ? (
          <div className="ok-auth">
            Cadastro feito! Se a confirmação por e-mail estiver ativada, confira sua caixa de entrada antes de entrar.
          </div>
        ) : null}

        {!ok && (
          <>
            <form onSubmit={onSubmit}>
              <div className="campo">
                <label htmlFor="nome">Nome</label>
                <input id="nome" type="text" required autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="campo">
                <label htmlFor="email">E-mail</label>
                <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="campo">
                <label htmlFor="senha">Senha</label>
                <input id="senha" type="password" required minLength={6} autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
              </div>
              <button className="btn vermelho" type="submit" style={{ width: "100%" }} disabled={enviando || !backendConectado}>
                {enviando ? "Criando conta…" : "Criar conta"}
              </button>
            </form>

            <button className="btn creme" type="button" style={{ width: "100%", marginTop: 14 }} onClick={onGoogle} disabled={!backendConectado}>
              Cadastrar com Google
            </button>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, display: "grid", gap: 8 }}>
          {ok ? <Link to="/entrar">Ir para o login →</Link> : (
            <span>
              Já tem conta? <Link to="/entrar">Entrar</Link>
            </span>
          )}
          <Link to="/">← Voltar para o site</Link>
        </div>
      </div>
    </div>
  );
}
