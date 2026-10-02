import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseConectado } from "@/integrations/supabase/client";
import type { Perfil } from "@/integrations/supabase/types";

interface AuthContextValue {
  carregando: boolean;
  session: Session | null;
  user: User | null;
  perfil: Perfil | null;
  isAdmin: boolean;
  backendConectado: boolean;
  entrar: (email: string, senha: string) => Promise<{ erro: string | null }>;
  entrarComGoogle: (depois?: string) => Promise<{ erro: string | null }>;
  cadastrar: (email: string, senha: string, nome: string) => Promise<{ erro: string | null }>;
  recuperarSenha: (email: string) => Promise<{ erro: string | null }>;
  sair: () => Promise<void>;
  atualizarPerfil: (dados: { nome?: string; telefone?: string }) => Promise<{ erro: string | null }>;
  recarregarPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  async function carregarPerfilEPapel(userId: string) {
    const [{ data: perfilData }, { data: papelData }] = await Promise.all([
      supabase.from("perfis").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
    ]);
    setPerfil((perfilData as Perfil) ?? null);
    setIsAdmin(Boolean(papelData));
  }

  useEffect(() => {
    if (!supabaseConectado) {
      setCarregando(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) carregarPerfilEPapel(data.session.user.id);
      setCarregando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_evento, novaSession) => {
      setSession(novaSession);
      if (novaSession?.user) {
        setTimeout(() => carregarPerfilEPapel(novaSession.user.id), 0);
      } else {
        setPerfil(null);
        setIsAdmin(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function entrar(email: string, senha: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    return { erro: error ? traduzErro(error.message) : null };
  }

  async function entrarComGoogle(depois?: string) {
    const destino = depois && depois.startsWith("/") ? depois : "/minha-conta";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + destino },
    });
    return { erro: error ? traduzErro(error.message) : null };
  }

  async function cadastrar(email: string, senha: string, nome: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome },
        emailRedirectTo: window.location.origin + "/minha-conta",
      },
    });
    return { erro: error ? traduzErro(error.message) : null };
  }

  async function recuperarSenha(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/entrar",
    });
    return { erro: error ? traduzErro(error.message) : null };
  }

  async function sair() {
    await supabase.auth.signOut();
  }

  async function atualizarPerfil(dados: { nome?: string; telefone?: string }) {
    if (!session?.user) return { erro: "Você precisa estar logado." };
    const { error } = await supabase.from("perfis").update(dados).eq("id", session.user.id);
    if (!error) await carregarPerfilEPapel(session.user.id);
    return { erro: error ? traduzErro(error.message) : null };
  }

  async function recarregarPerfil() {
    if (session?.user) await carregarPerfilEPapel(session.user.id);
  }

  return (
    <AuthContext.Provider
      value={{
        carregando,
        session,
        user: session?.user ?? null,
        perfil,
        isAdmin,
        backendConectado: supabaseConectado,
        entrar,
        entrarComGoogle,
        cadastrar,
        recuperarSenha,
        sair,
        atualizarPerfil,
        recarregarPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}

function traduzErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("user already registered")) return "Esse e-mail já tem cadastro. Tente entrar.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  return msg;
}
