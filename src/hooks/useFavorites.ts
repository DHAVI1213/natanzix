import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useFavorites() {
  const { user, backendConectado } = useAuth();
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    if (!backendConectado || !user) {
      setFavoritos(new Set());
      return;
    }
    setCarregando(true);
    const { data } = await supabase.from("favoritos").select("produto_id").eq("user_id", user.id);
    setFavoritos(new Set((data ?? []).map((f) => f.produto_id as string)));
    setCarregando(false);
  }, [user, backendConectado]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function alternar(produtoId: string): Promise<boolean> {
    if (!backendConectado || !user) return false;
    if (favoritos.has(produtoId)) {
      await supabase.from("favoritos").delete().eq("user_id", user.id).eq("produto_id", produtoId);
      setFavoritos((prev) => {
        const novo = new Set(prev);
        novo.delete(produtoId);
        return novo;
      });
    } else {
      await supabase.from("favoritos").insert({ user_id: user.id, produto_id: produtoId });
      setFavoritos((prev) => new Set(prev).add(produtoId));
    }
    return true;
  }

  return { favoritos, carregando, alternar, recarregar: carregar };
}
