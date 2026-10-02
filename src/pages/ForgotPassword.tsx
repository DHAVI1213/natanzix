import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-frango-no-pote.png";
import { useAuth } from "@/hooks/useAuth";

export default function ForgotPassword() {
  const { recuperarSenha, backendConectado } = useAuth();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const { erro } = await recuperarSenha(email);
    setEnviando(false);
    if (erro) setErro(erro);
    else setOk(true);
  }

  return (
    <div className="tela-auth">
      <div className="cartao-auth">
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <img src={logo} alt="Frango no Pote" width={64} height={64} style={{ borderRadius: "50%", border: "3px solid #1B1B1B", margin: "0 auto 10px", boxShadow: "3px 3px 0 #1B1B1B" }} />
          <h1 className="titulo" style={{ fontSize: "clamp(28px,5.5vw,42px)" }}>
            recuperar senha
          </h1>
        </div>

        {!backendConectado ? (
          <div className="erro-auth">Essa função ainda não funciona porque o backend não está conectado a este projeto.</div>
        ) : null}
        {erro ? <div className="erro-auth">{erro}</div> : null}
        {ok ? (
          <div className="ok-auth">Se esse e-mail tiver cadastro, enviamos um link para redefinir a senha.</div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="campo">
              <label htmlFor="email">E-mail</label>
              <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn vermelho" type="submit" style={{ width: "100%" }} disabled={enviando || !backendConectado}>
              {enviando ? "Enviando…" : "Enviar link"}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, display: "grid", gap: 8 }}>
          <Link to="/entrar">← Voltar para o login</Link>
        </div>
      </div>
    </div>
  );
}
