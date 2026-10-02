import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Perfil } from "@/integrations/supabase/types";

export default function AdminCustomers() {
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [contagem, setContagem] = useState<Record<string, number>>({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: favs }] = await Promise.all([
        supabase.from("perfis").select("*").order("criado_em", { ascending: false }),
        supabase.from("favoritos").select("user_id"),
      ]);
      setPerfis((p as Perfil[]) ?? []);
      const mapa: Record<string, number> = {};
      (favs ?? []).forEach((f: { user_id: string }) => {
        mapa[f.user_id] = (mapa[f.user_id] || 0) + 1;
      });
      setContagem(mapa);
      setCarregando(false);
    })();
  }, []);

  const linhasCsv = useMemo(() => {
    const cab = "Nome,Telefone,Cadastrado em,Favoritos";
    const linhas = perfis.map((p) => {
      const data = new Date(p.criado_em).toLocaleDateString("pt-BR");
      const campos = [p.nome || "", p.telefone || "", data, String(contagem[p.id] || 0)];
      return campos.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");
    });
    return [cab, ...linhas].join("\n");
  }, [perfis, contagem]);

  function exportarCsv() {
    const blob = new Blob(["﻿" + linhasCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes-frango-no-pote-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <h2 className="titulo" style={{ fontSize: 28 }}>
          Clientes
        </h2>
        <button className="btn peq" onClick={exportarCsv} disabled={perfis.length === 0}>
          Exportar CSV
        </button>
      </div>

      {carregando ? (
        <p>Carregando…</p>
      ) : perfis.length === 0 ? (
        <p>Ainda não há clientes cadastrados.</p>
      ) : (
        <table className="tabela-adm">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Cadastrado em</th>
              <th>Favoritos</th>
            </tr>
          </thead>
          <tbody>
            {perfis.map((p) => (
              <tr key={p.id}>
                <td>{p.nome || "—"}</td>
                <td>{p.telefone || "—"}</td>
                <td>{new Date(p.criado_em).toLocaleDateString("pt-BR")}</td>
                <td>{contagem[p.id] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
