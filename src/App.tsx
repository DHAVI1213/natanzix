import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Loader from "@/components/Loader";
import CursorCoxinha from "@/components/CursorCoxinha";
import Header from "@/components/Header";
import MobileStickyBar from "@/components/MobileStickyBar";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import MyAccount from "@/pages/MyAccount";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminStore from "@/pages/admin/AdminStore";
import AdminCustomers from "@/pages/admin/AdminCustomers";

function ChromeDoSite() {
  const location = useLocation();
  const ehAdmin = location.pathname.startsWith("/admin");
  const ehAuth = ["/entrar", "/cadastro", "/recuperar-senha", "/minha-conta"].includes(location.pathname);
  if (ehAdmin || ehAuth) return null;
  return (
    <>
      <Header />
      <MobileStickyBar />
    </>
  );
}

function NaoEncontrada() {
  return (
    <div className="tela-auth">
      <div className="cartao-auth" style={{ textAlign: "center" }}>
        <h1 className="titulo">ops!</h1>
        <p>Essa página não existe.</p>
        <Link className="btn vermelho" to="/" style={{ marginTop: 16 }}>
          Voltar pro início
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  const [carregou, setCarregou] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        {!carregou ? <Loader onDone={() => setCarregou(true)} /> : null}
        <CursorCoxinha />
        <ChromeDoSite />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/entrar" element={<Login />} />
          <Route path="/cadastro" element={<Signup />} />
          <Route path="/recuperar-senha" element={<ForgotPassword />} />
          <Route path="/minha-conta" element={<MyAccount />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="produtos" replace />} />
            <Route path="produtos" element={<AdminProducts />} />
            <Route path="categorias" element={<AdminCategories />} />
            <Route path="loja" element={<AdminStore />} />
            <Route path="clientes" element={<AdminCustomers />} />
          </Route>
          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
