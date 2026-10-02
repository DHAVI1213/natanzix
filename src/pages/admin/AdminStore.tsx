import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LojaConfig } from "@/integrations/supabase/types";

const DIAS: Array<[string, string]> = [
  ["segunda", "Segunda"],
  ["terca", "Terça"],
  ["quarta", "Quarta"],
  ["quinta", "Quinta"],
  ["sexta", "Sexta"],
  ["sabado", "Sábado"],
  ["domingo", "Domingo"],
];

type HorarioDia = { abre: string; fecha: string } | null;

export default function AdminStore() {
  const [loja, setLoja] = useState<LojaConfig | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("loja_config").select("*").maybeSingle();
      setLoja(data as LojaConfig);
      setCarregando(false);
    })();
  }, []);

  function campo<K extends keyof LojaConfig>(chave: K, valor: LojaConfig[K]) {
    setLoja((l) => (l ? { ...l, [chave]: valor } : l));
  }

  function horarioDia(dia: string): HorarioDia {
    return (loja?.horarios?.[dia] as HorarioDia) ?? null;
  }

  function setHorarioDia(dia: string, campoNome: "abre" | "fecha", valor: string) {
    setLoja((l) => {
      if (!l) return l;
      const atual = (l.horarios?.[dia] as HorarioDia) || { abre: "18:00", fecha: "23:00" };
      return { ...l, horarios: { ...l.horarios, [dia]: { ...atual, [campoNome]: valor } } };
    });
  }

  function alternarFechado(dia: string) {
    setLoja((l) => {
      if (!l) return l;
      const fechado = !l.horarios?.[dia];
      return { ...l, horarios: { ...l.horarios, [dia]: fechado ? null : { abre: "18:00", fecha: "23:00" } } };
    });
  }

  async function salvar() {
    if (!loja) return;
    setSalvando(true);
    setMsg(null);
    const { id, atualizado_em, ...payload } = loja;
    const { error } = await supabase.from("loja_config").update(payload).eq("id", id);
    setSalvando(false);
    setMsg(error ? "Erro ao salvar: " + error.message : "Dados da loja salvos!");
  }

  if (carregando) return <p>Carregando…</p>;
  if (!loja) return <p>Não há dados de loja cadastrados ainda.</p>;

  return (
    <div style={{ maxWidth: 680 }}>
      <h2 className="titulo" style={{ fontSize: 28, marginBottom: 16 }}>
        Dados da loja
      </h2>
      {msg ? <div className={msg.startsWith("Erro") ? "erro-auth" : "ok-auth"}>{msg}</div> : null}

      <div className="campo">
        <label>Nome da loja</label>
        <input value={loja.nome} onChange={(e) => campo("nome", e.target.value)} />
      </div>
      <div className="campo">
        <label>Endereço</label>
        <input value={loja.endereco} onChange={(e) => campo("endereco", e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div className="campo" style={{ flex: 1 }}>
          <label>Cidade</label>
          <input value={loja.cidade} onChange={(e) => campo("cidade", e.target.value)} />
        </div>
        <div className="campo" style={{ width: 90 }}>
          <label>UF</label>
          <input value={loja.uf} onChange={(e) => campo("uf", e.target.value.toUpperCase())} maxLength={2} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div className="campo" style={{ flex: 1 }}>
          <label>Latitude</label>
          <input
            inputMode="decimal"
            value={loja.latitude ?? ""}
            onChange={(e) => campo("latitude", e.target.value === "" ? (null as unknown as number) : Number(e.target.value))}
          />
        </div>
        <div className="campo" style={{ flex: 1 }}>
          <label>Longitude</label>
          <input
            inputMode="decimal"
            value={loja.longitude ?? ""}
            onChange={(e) => campo("longitude", e.target.value === "" ? (null as unknown as number) : Number(e.target.value))}
          />
        </div>
      </div>
      <div className="campo">
        <label>Link da loja no iFood</label>
        <input value={loja.ifood_url} onChange={(e) => campo("ifood_url", e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div className="campo" style={{ flex: 1 }}>
          <label>WhatsApp</label>
          <input
            placeholder="(61) 90000-0000"
            value={loja.whatsapp ?? ""}
            onChange={(e) => campo("whatsapp", e.target.value)}
          />
        </div>
        <div className="campo" style={{ flex: 1 }}>
          <label>Instagram</label>
          <input
            placeholder="@frangonopote"
            value={loja.instagram ?? ""}
            onChange={(e) => campo("instagram", e.target.value)}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div className="campo" style={{ flex: 1 }}>
          <label>Nota no iFood</label>
          <input
            inputMode="decimal"
            value={loja.nota_ifood ?? ""}
            onChange={(e) => campo("nota_ifood", e.target.value === "" ? (null as unknown as number) : Number(e.target.value))}
          />
        </div>
        <div className="campo" style={{ flex: 1 }}>
          <label>Selo no iFood</label>
          <input value={loja.selo_ifood ?? ""} onChange={(e) => campo("selo_ifood", e.target.value)} />
        </div>
      </div>

      <h3 className="sub" style={{ color: "var(--vermelho)", marginTop: 24 }}>
        horário de funcionamento
      </h3>
      <div style={{ display: "grid", gap: 8 }}>
        {DIAS.map(([chave, label]) => {
          const h = horarioDia(chave);
          return (
            <div key={chave} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ width: 80, fontSize: 14 }}>{label}</span>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, textTransform: "none" }}>
                <input type="checkbox" style={{ height: "auto", width: "auto" }} checked={!h} onChange={() => alternarFechado(chave)} />
                Fechado
              </label>
              {h ? (
                <>
                  <input type="time" value={h.abre} onChange={(e) => setHorarioDia(chave, "abre", e.target.value)} style={{ height: 36, border: "2px solid #1B1B1B", borderRadius: 8 }} />
                  <span>até</span>
                  <input type="time" value={h.fecha} onChange={(e) => setHorarioDia(chave, "fecha", e.target.value)} style={{ height: 36, border: "2px solid #1B1B1B", borderRadius: 8 }} />
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <button className="btn vermelho" style={{ marginTop: 24 }} onClick={salvar} disabled={salvando}>
        {salvando ? "Salvando…" : "Salvar dados da loja"}
      </button>
    </div>
  );
}
