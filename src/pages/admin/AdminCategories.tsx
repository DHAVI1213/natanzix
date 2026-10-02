import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Categoria } from "@/integrations/supabase/types";

export default function AdminCategories() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novoNome, setNovoNome] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [arrastando, setArrastando] = useState<string | null>(null);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase.from("categorias").select("*").order("ordem", { ascending: true });
    setCategorias((data as Categoria[]) ?? []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criar() {
    const nome = novoNome.trim();
    if (!nome) return;
    setSalvando(true);
    const proximaOrdem = (categorias.at(-1)?.ordem ?? 0) + 1;
    const { error } = await supabase.from("categorias").insert({ nome, ordem: proximaOrdem, ativo: true });
    setSalvando(false);
    if (error) {
      alert("Erro ao criar categoria: " + error.message);
      return;
    }
    setNovoNome("");
    carregar();
  }

  async function renomear(c: Categoria) {
    const novo = prompt("Novo nome da categoria:", c.nome);
    if (!novo || novo.trim() === "" || novo === c.nome) return;
    const { error } = await supabase.from("categorias").update({ nome: novo.trim() }).eq("id", c.id);
    if (error) alert("Erro: " + error.message);
    else carregar();
  }

  async function alternarAtivo(c: Categoria) {
    const { error } = await supabase.from("categorias").update({ ativo: !c.ativo }).eq("id", c.id);
    if (error) alert("Erro: " + error.message);
    else carregar();
  }

  async function apagar(c: Categoria) {
    if (!confirm(`Apagar a categoria "${c.nome}"? Isso só funciona se não houver produtos nela.`)) return;
    const { error } = await supabase.from("categorias").delete().eq("id", c.id);
    if (error) alert("Não deu para apagar: " + error.message);
    else carregar();
  }

  async function salvarNovaOrdem(lista: Categoria[]) {
    setCategorias(lista);
    await Promise.all(lista.map((c, i) => supabase.from("categorias").update({ ordem: i + 1 }).eq("id", c.id)));
  }

  function onDrop(alvoId: string) {
    if (!arrastando || arrastando === alvoId) return;
    const lista = [...categorias];
    const origemIdx = lista.findIndex((c) => c.id === arrastando);
    const alvoIdx = lista.findIndex((c) => c.id === alvoId);
    const [item] = lista.splice(origemIdx, 1);
    lista.splice(alvoIdx, 0, item);
    salvarNovaOrdem(lista);
    setArrastando(null);
  }

  return (
    <div>
      <h2 className="titulo" style={{ fontSize: 28, marginBottom: 16 }}>
        Categorias
      </h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          className="campo-input"
          placeholder="Nome da nova categoria"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          style={{ height: 44, padding: "0 14px", border: "3px solid #1B1B1B", borderRadius: 12, flex: 1, minWidth: 200 }}
        />
        <button className="btn peq" onClick={criar} disabled={salvando}>
          + Nova categoria
        </button>
      </div>

      {carregando ? (
        <p>Carregando…</p>
      ) : (
        <table className="tabela-adm">
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>Nome</th>
              <th>Ordem</th>
              <th>Ativa</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr
                key={c.id}
                draggable
                className={arrastando === c.id ? "arrastando" : ""}
                onDragStart={() => setArrastando(c.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(c.id)}
              >
                <td aria-hidden="true">⠿</td>
                <td>{c.nome}</td>
                <td>{c.ordem}</td>
                <td>{c.ativo ? "Sim" : "Não"}</td>
                <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn peq creme" onClick={() => renomear(c)}>
                    Renomear
                  </button>
                  <button className="btn peq creme" onClick={() => alternarAtivo(c)}>
                    {c.ativo ? "Desativar" : "Ativar"}
                  </button>
                  <button className="btn peq vermelho" onClick={() => apagar(c)}>
                    Apagar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ fontSize: 13, marginTop: 10, color: "#555" }}>Arraste uma linha pelo ⠿ para reordenar as categorias.</p>
    </div>
  );
}
