import { useCallback, useEffect, useState } from "react";
import { supabase, supabaseConectado } from "@/integrations/supabase/client";
import type { Categoria, LojaConfig, Produto } from "@/integrations/supabase/types";

interface EstadoLoja {
  carregando: boolean;
  erro: string | null;
  categorias: Categoria[];
  produtos: Produto[];
  loja: LojaConfig | null;
  backendConectado: boolean;
  recarregar: () => void;
}

export function useStoreData(): EstadoLoja {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loja, setLoja] = useState<LojaConfig | null>(null);
  const [tick, setTick] = useState(0);

  const recarregar = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!supabaseConectado) {
      setCarregando(false);
      setErro(
        "O backend (Lovable Cloud / Supabase) ainda não está conectado a este projeto, então o cardápio não pode ser carregado agora."
      );
      return;
    }

    let cancelado = false;
    setCarregando(true);
    setErro(null);

    (async () => {
      const [catRes, prodRes, lojaRes] = await Promise.all([
        supabase.from("categorias").select("*").eq("ativo", true).order("ordem", { ascending: true }),
        supabase.from("produtos").select("*").eq("ativo", true).order("ordem", { ascending: true }),
        supabase.from("loja_config").select("*").maybeSingle(),
      ]);

      if (cancelado) return;

      if (catRes.error || prodRes.error || lojaRes.error) {
        setErro(catRes.error?.message || prodRes.error?.message || lojaRes.error?.message || "Erro ao carregar dados.");
        setCarregando(false);
        return;
      }

      setCategorias((catRes.data as Categoria[]) ?? []);
      setProdutos((prodRes.data as Produto[]) ?? []);
      setLoja((lojaRes.data as LojaConfig) ?? null);
      setCarregando(false);
    })();

    return () => {
      cancelado = true;
    };
  }, [tick]);

  return { carregando, erro, categorias, produtos, loja, backendConectado: supabaseConectado, recarregar };
}
