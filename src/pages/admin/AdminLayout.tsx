import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo-frango-no-pote.png";

export default function AdminLayout() {
  const { user, isAdmin, carregando, sair, backendConectado } = useAuth();

  if (carregando) return <div className="painel" style={{ padding: 40 }}>Carregando…</div>;
  if (!backendConectado) {
    return (
      <div className="painel" style={{ padding: 40 }}>
        <p>O painel do dono precisa do backend (Lovable Cloud / Supabase) conectado a este projeto para funcionar.</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/entrar?depois=/admin" replace />;
  if (!isAdmin) {
    return (
      <div className="painel" style={{ display: "grid", placeItems: "center", minHeight: "100svh", textAlign: "center", padding: 24 }}>
        <div>
          <h1 className="titulo" style={{ color: "var(--vermelho)" }}>
            acesso negado
          </h1>
          <p>Essa área é só para o administrador da loja.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="painel">
      <div className="painel-topo">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={logo} alt="" width={36} height={36} style={{ borderRadius: "50%", border: "2px solid #1B1B1B" }} />
          <strong style={{ font: "400 22px var(--cond)", textTransform: "uppercase" }}>painel do dono</strong>
        </div>
        <button className="btn peq creme" onClick={sair}>
          Sair
        </button>
      </div>
      <nav className="painel-nav">
        <NavLink to="/admin/produtos" className={({ isActive }) => (isActive ? "ativo" : "")}>
          Produtos
        </NavLink>
        <NavLink to="/admin/categorias" className={({ isActive }) => (isActive ? "ativo" : "")}>
          Categorias
        </NavLink>
        <NavLink to="/admin/loja" className={({ isActive }) => (isActive ? "ativo" : "")}>
          Loja
        </NavLink>
        <NavLink to="/admin/clientes" className={({ isActive }) => (isActive ? "ativo" : "")}>
          Clientes
        </NavLink>
      </nav>
      <div className="painel-corpo">
        <Outlet />
      </div>
    </div>
  );
}
