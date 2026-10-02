import { createClient } from "@supabase/supabase-js";

// Essas duas variáveis são públicas (chave "anon"/publishable do Supabase,
// segura para rodar no navegador) e são preenchidas automaticamente pelo
// Lovable Cloud quando o backend do projeto está conectado. Nenhuma chave
// secreta deve ser colocada aqui.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;

export const supabaseConectado = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

// Quando o backend ainda não está conectado, usamos uma URL/placeholder
// local para o cliente não quebrar — todas as chamadas falham de forma
// controlada e as telas mostram um aviso amigável em vez de travar o site.
export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_PUBLISHABLE_KEY || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  }
);
