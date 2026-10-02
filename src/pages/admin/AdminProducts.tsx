import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Categoria, Produto } from "@/integrations/supabase/types";
import { brl } from "@/lib/utils";

type Rascunho = {
  categoria_id: string;
  nome: string;
  descricao: string;
  preco: string;
  a_partir_de: boolean;
  imagem_url: string;
  ifood_item_id: string;
  destaque: boolean;
  ativo: boolean;
};

const RASCUNHO_VAZIO: Rascunho = {
  categoria_id: "",
  nome: "",
  descricao: "",
  preco: "",
  a_partir_de: false,
  imagem_url: "",
  ifood_item_id: "",
  destaque: false,
  ativo: true,
};

export default function AdminProducts() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [ifoodUrl, setIfoodUrl] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [editando, setEditando] = useState<Produto | null>(null);
  const [criando, setCriando] = useState(false);
  const [rascunho, setRascunho] = useState<Rascunho>(RASCUNHO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [arrastando, setArrastando] = useState<string | null>(null);

  async function carregar() {
    setCarregando(true);
    const [{ data: p }, { data: c }, { data: l }] = await Promise.all([
      supabase.from("produtos").select("*").order("ordem", { ascending: true }),
      supabase.from("categorias").select("*").order("ordem", { ascending: true }),
      supabase.from("loja_config").select("ifood_url").maybeSingle(),
    ]);
    setProdutos((p as Produto[]) ?? []);
    setCategorias((c as Categoria[]) ?? []);
    setIfoodUrl((l as { ifood_url?: string } | null)?.ifood_url ?? null);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  const nomeCategoria = (id: string) => categorias.find((c) => c.id === id)?.nome || "—";

  const listaFiltrada = useMemo(() => {
    return produtos.filter((p) => {
      const bateBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase());
      const bateCategoria = filtroCategoria === "todas" || p.categoria_id === filtroCategoria;
      return bateBusca && bateCategoria;
    });
  }, [produtos, busca, filtroCategoria]);

  function abrirNovo() {
    setRascunho({ ...RASCUNHO_VAZIO, categoria_id: categorias[0]?.id || "" });
    setCriando(true);
    setEditando(null);
  }

  function abrirEdicao(p: Produto) {
    setRascunho({
      categoria_id: p.categoria_id,
      nome: p.nome,
      descricao: p.descricao || "",
      preco: String(p.preco),
      a_partir_de: p.a_partir_de,
      imagem_url: p.imagem_url || "",
      ifood_item_id: p.ifood_item_id || "",
      destaque: p.destaque,
      ativo: p.ativo,
    });
    setEditando(p);
    setCriando(false);
  }

  function fecharForm() {
    setEditando(null);
    setCriando(false);
  }

  async function onEnviarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setEnviandoFoto(true);
    const extensao = arquivo.name.split(".").pop() || "jpg";
    const caminho = `${crypto.randomUUID()}.${extensao}`;
    const { error } = await supabase.storage.from("produtos").upload(caminho, arquivo, { upsert: true });
    setEnviandoFoto(false);
    if (error) {
      alert("Erro ao enviar a foto: " + error.message);
      return;
    }
    const { data } = supabase.storage.from("produtos").getPublicUrl(caminho);
    setRascunho((r) => ({ ...r, imagem_url: data.publicUrl }));
  }

  async function salvar() {
    if (!rascunho.nome.trim() || !rascunho.categoria_id) {
      alert("Preencha pelo menos o nome e a categoria.");
      return;
    }
    setSalvando(true);
    const payload = {
      categoria_id: rascunho.categoria_id,
      nome: rascunho.nome.trim(),
      descricao: rascunho.descricao.trim() || null,
      preco: Number(rascunho.preco.replace(",", ".")) || 0,
      a_partir_de: rascunho.a_partir_de,
      imagem_url: rascunho.imagem_url.trim() || null,
      ifood_item_id: rascunho.ifood_item_id.trim() || null,
      destaque: rascunho.destaque,
      ativo: rascunho.ativo,
    };

    const { error } = editando
      ? await supabase.from("produtos").update(payload).eq("id", editando.id)
      : await supabase.from("produtos").insert({ ...payload, ordem: produtos.length + 1 });

    setSalvando(false);
    if (error) {
      alert("Erro ao salvar: " + error.message);
      return;
    }
    fecharForm();
    carregar();
  }

  async function alternarCampo(p: Produto, campo: "ativo" | "destaque") {
    const { error } = await supabase.from("produtos").update({ [campo]: !p[campo] }).eq("id", p.id);
    if (error) alert("Erro: " + error.message);
    else carregar();
  }

  async function apagar(p: Produto) {
    if (!confirm(`Apagar "${p.nome}" para sempre? Prefira "Desativar" se for algo temporário.`)) return;
    const { error } = await supabase.from("produtos").delete().eq("id", p.id);
    if (error) alert("Erro: " + error.message);
    else carregar();
  }

  function testarLink(p: Produto) {
    if (!ifoodUrl || !p.ifood_item_id) {
      alert("Preencha o link do iFood da loja (aba Loja) e o id do item no iFood para testar.");
      return;
    }
    window.open(`${ifoodUrl}?prato=${p.ifood_item_id}`, "_blank", "noopener");
  }

  async function onDrop(alvoId: string) {
    if (!arrastando || arrastando === alvoId || filtroCategoria === "todas") return;
    const lista = [...listaFiltrada];
    const origemIdx = lista.findIndex((p) => p.id === arrastando);
    const alvoIdx = lista.findIndex((p) => p.id === alvoId);
    const [item] = lista.splice(origemIdx, 1);
    lista.splice(alvoIdx, 0, item);
    setProdutos((prev) => {
      const outros = prev.filter((p) => !lista.some((l) => l.id === p.id));
      return [...outros, ...lista];
    });
    await Promise.all(lista.map((p, i) => supabase.from("produtos").update({ ordem: i + 1 }).eq("id", p.id)));
    setArrastando(null);
  }

  return (
    <div>
      <h2 className="titulo" style={{ fontSize: 28, marginBottom: 16 }}>
        Produtos
      </h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <input
          placeholder="Buscar produto…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ height: 44, padding: "0 14px", border: "3px solid #1B1B1B", borderRadius: 12, flex: 1, minWidth: 200 }}
        />
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          style={{ height: 44, padding: "0 14px", border: "3px solid #1B1B1B", borderRadius: 12 }}
        >
          <option value="todas">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        <button className="btn peq" onClick={abrirNovo}>
          + Novo produto
        </button>
      </div>

      {filtroCategoria === "todas" ? (
        <p style={{ fontSize: 13, color: "#555", marginBottom: 10 }}>
          Dica: escolha uma categoria no filtro para poder arrastar e reordenar os produtos dela.
        </p>
      ) : null}

      {carregando ? (
        <p>Carregando…</p>
      ) : (
        <table className="tabela-adm">
          <thead>
            <tr>
              <th style={{ width: 36 }}></th>
              <th>Foto</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Destaque</th>
              <th>Ativo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.map((p) => (
              <tr
                key={p.id}
                draggable={filtroCategoria !== "todas"}
                className={arrastando === p.id ? "arrastando" : ""}
                onDragStart={() => setArrastando(p.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(p.id)}
              >
                <td aria-hidden="true">{filtroCategoria !== "todas" ? "⠿" : ""}</td>
                <td>
                  {p.imagem_url ? (
                    <img src={p.imagem_url} alt="" width={36} height={36} style={{ objectFit: "contain" }} />
                  ) : (
                    "—"
                  )}
                </td>
                <td>{p.nome}</td>
                <td>{nomeCategoria(p.categoria_id)}</td>
                <td>{p.a_partir_de ? "a partir de " : ""}{brl(Number(p.preco))}</td>
                <td>
                  <button className="btn peq creme" onClick={() => alternarCampo(p, "destaque")}>
                    {p.destaque ? "★ Sim" : "☆ Não"}
                  </button>
                </td>
                <td>
                  <button className="btn peq creme" onClick={() => alternarCampo(p, "ativo")}>
                    {p.ativo ? "Sim" : "Não"}
                  </button>
                </td>
                <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn peq" onClick={() => abrirEdicao(p)}>
                    Editar
                  </button>
                  <button className="btn peq vermelho" onClick={() => apagar(p)}>
                    Apagar
                  </button>
                </td>
              </tr>
            ))}
            {listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 24 }}>
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      )}

      {(criando || editando) && (
        <div
          role="dialog"
          aria-label={editando ? "Editar produto" : "Novo produto"}
          style={{ position: "fixed", inset: 0, background: "rgba(27,27,27,.6)", zIndex: 50, display: "grid", placeItems: "center", padding: 16 }}
          onClick={fecharForm}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", border: "3px solid #1B1B1B", borderRadius: 24, boxShadow: "8px 8px 0 #1B1B1B", padding: 24, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}
          >
            <h3 className="titulo" style={{ fontSize: 24, marginBottom: 14 }}>
              {editando ? "Editar produto" : "Novo produto"}
            </h3>

            <div className="campo">
              <label>Categoria</label>
              <select
                value={rascunho.categoria_id}
                onChange={(e) => setRascunho((r) => ({ ...r, categoria_id: e.target.value }))}
                style={{ height: 48, border: "3px solid #1B1B1B", borderRadius: 12, padding: "0 10px" }}
              >
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label>Nome</label>
              <input value={rascunho.nome} onChange={(e) => setRascunho((r) => ({ ...r, nome: e.target.value }))} />
            </div>
            <div className="campo">
              <label>Descrição</label>
              <input value={rascunho.descricao} onChange={(e) => setRascunho((r) => ({ ...r, descricao: e.target.value }))} />
            </div>
            <div className="campo">
              <label>Preço (R$)</label>
              <input
                inputMode="decimal"
                value={rascunho.preco}
                onChange={(e) => setRascunho((r) => ({ ...r, preco: e.target.value }))}
              />
            </div>
            <div className="campo" style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: "row" }}>
              <input
                type="checkbox"
                id="apartir"
                style={{ height: "auto", width: "auto" }}
                checked={rascunho.a_partir_de}
                onChange={(e) => setRascunho((r) => ({ ...r, a_partir_de: e.target.checked }))}
              />
              <label htmlFor="apartir" style={{ textTransform: "none" }}>
                Mostrar "a partir de" antes do preço
              </label>
            </div>
            <div className="campo">
              <label>Foto do produto</label>
              <input type="file" accept="image/*" onChange={onEnviarFoto} disabled={enviandoFoto} />
              {rascunho.imagem_url ? (
                <img src={rascunho.imagem_url} alt="" width={80} height={80} style={{ objectFit: "contain", marginTop: 6 }} />
              ) : null}
              {enviandoFoto ? <span style={{ fontSize: 12 }}>Enviando…</span> : null}
            </div>
            <div className="campo">
              <label>ID do item no iFood</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={rascunho.ifood_item_id}
                  onChange={(e) => setRascunho((r) => ({ ...r, ifood_item_id: e.target.value }))}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn peq creme"
                  onClick={() => {
                    if (!ifoodUrl || !rascunho.ifood_item_id) {
                      alert("Preencha o id do iFood (e o link da loja na aba Loja) para testar.");
                      return;
                    }
                    window.open(`${ifoodUrl}?prato=${rascunho.ifood_item_id}`, "_blank", "noopener");
                  }}
                >
                  Testar link
                </button>
              </div>
            </div>
            <div className="campo" style={{ display: "flex", gap: 20, flexDirection: "row" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, textTransform: "none" }}>
                <input
                  type="checkbox"
                  style={{ height: "auto", width: "auto" }}
                  checked={rascunho.destaque}
                  onChange={(e) => setRascunho((r) => ({ ...r, destaque: e.target.checked }))}
                />
                Destaque (carrossel)
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, textTransform: "none" }}>
                <input
                  type="checkbox"
                  style={{ height: "auto", width: "auto" }}
                  checked={rascunho.ativo}
                  onChange={(e) => setRascunho((r) => ({ ...r, ativo: e.target.checked }))}
                />
                Ativo (aparece no site)
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button className="btn peq vermelho" onClick={salvar} disabled={salvando}>
                {salvando ? "Salvando…" : "Salvar"}
              </button>
              {editando ? (
                <button
                  type="button"
                  className="btn peq"
                  onClick={() => {
                    if (editando) testarLink(editando);
                  }}
                >
                  Testar link no iFood
                </button>
              ) : null}
              <button className="btn peq creme" onClick={fecharForm}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
