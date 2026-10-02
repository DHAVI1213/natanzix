export type AppRole = "admin" | "cliente";

export interface Categoria {
  id: string;
  nome: string;
  ordem: number;
  ativo: boolean;
  criado_em: string;
}

export interface Produto {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  a_partir_de: boolean;
  imagem_url: string | null;
  ifood_item_id: string | null;
  destaque: boolean;
  ativo: boolean;
  ordem: number;
  criado_em: string;
  atualizado_em: string;
}

export interface LojaConfig {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  uf: string;
  latitude: number | null;
  longitude: number | null;
  ifood_url: string;
  whatsapp: string | null;
  instagram: string | null;
  horarios: Record<string, { abre: string; fecha: string } | null>;
  nota_ifood: number | null;
  selo_ifood: string | null;
  atualizado_em: string;
}

export interface Perfil {
  id: string;
  nome: string | null;
  telefone: string | null;
  criado_em: string;
}

export interface Favorito {
  user_id: string;
  produto_id: string;
  criado_em: string;
}
