-- ============================================================
-- Frango no Pote — Formosa Centro
-- Esquema de banco: categorias, produtos, loja_config, perfis,
-- favoritos, papéis de usuário (user_roles) e bucket de fotos.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- papéis (admin / cliente) ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'cliente');
  end if;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  criado_em timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- função SECURITY DEFINER: evita recursão de RLS e evita guardar o papel
-- em `perfis` (onde o próprio usuário poderia tentar alterar).
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "somente admin le papeis"
  on public.user_roles for select
  using (public.has_role(auth.uid(), 'admin'));
-- ninguém altera user_roles pelo site (nem admin): só via SQL/console.

-- ---------- categorias ----------
create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ordem integer not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

alter table public.categorias enable row level security;

create policy "qualquer visitante le categorias ativas"
  on public.categorias for select
  using (ativo = true or public.has_role(auth.uid(), 'admin'));

create policy "admin insere categorias"
  on public.categorias for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "admin edita categorias"
  on public.categorias for update
  using (public.has_role(auth.uid(), 'admin'));

create policy "admin apaga categorias"
  on public.categorias for delete
  using (public.has_role(auth.uid(), 'admin'));

-- ---------- produtos ----------
create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references public.categorias(id) on delete restrict,
  nome text not null,
  descricao text,
  preco numeric(10,2) not null default 0,
  a_partir_de boolean not null default false,
  imagem_url text,
  ifood_item_id text,
  destaque boolean not null default false,
  ativo boolean not null default true,
  ordem integer not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.produtos enable row level security;

create policy "qualquer visitante le produtos ativos"
  on public.produtos for select
  using (ativo = true or public.has_role(auth.uid(), 'admin'));

create policy "admin insere produtos"
  on public.produtos for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "admin edita produtos"
  on public.produtos for update
  using (public.has_role(auth.uid(), 'admin'));

create policy "admin apaga produtos"
  on public.produtos for delete
  using (public.has_role(auth.uid(), 'admin'));

create or replace function public.atualizar_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists trg_produtos_atualizado_em on public.produtos;
create trigger trg_produtos_atualizado_em
  before update on public.produtos
  for each row execute function public.atualizar_atualizado_em();

-- ---------- loja_config (uma linha só) ----------
create table if not exists public.loja_config (
  id uuid primary key default gen_random_uuid(),
  nome text not null default 'Frango no Pote',
  endereco text not null default '',
  cidade text not null default '',
  uf text not null default '',
  latitude numeric(10,7),
  longitude numeric(10,7),
  ifood_url text not null default '',
  whatsapp text,
  instagram text,
  horarios jsonb not null default '{}'::jsonb,
  nota_ifood numeric(2,1),
  selo_ifood text,
  atualizado_em timestamptz not null default now()
);

alter table public.loja_config enable row level security;

create policy "qualquer visitante le loja_config"
  on public.loja_config for select
  using (true);

create policy "admin insere loja_config"
  on public.loja_config for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "admin edita loja_config"
  on public.loja_config for update
  using (public.has_role(auth.uid(), 'admin'));

create policy "admin apaga loja_config"
  on public.loja_config for delete
  using (public.has_role(auth.uid(), 'admin'));

drop trigger if exists trg_loja_config_atualizado_em on public.loja_config;
create trigger trg_loja_config_atualizado_em
  before update on public.loja_config
  for each row execute function public.atualizar_atualizado_em();

-- ---------- perfis (clientes que fazem login) ----------
create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  telefone text,
  criado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;

create policy "usuario le o proprio perfil"
  on public.perfis for select
  using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));

create policy "usuario atualiza o proprio perfil"
  on public.perfis for update
  using (auth.uid() = id);

create policy "usuario cria o proprio perfil"
  on public.perfis for insert
  with check (auth.uid() = id);

-- cria o perfil automaticamente quando alguém se cadastra
create or replace function public.lidar_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, nome, telefone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'telefone'
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'cliente')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.lidar_novo_usuario();

-- ---------- favoritos ----------
create table if not exists public.favoritos (
  user_id uuid not null references public.perfis(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (user_id, produto_id)
);

alter table public.favoritos enable row level security;

create policy "usuario le os proprios favoritos"
  on public.favoritos for select
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "usuario cria os proprios favoritos"
  on public.favoritos for insert
  with check (auth.uid() = user_id);

create policy "usuario apaga os proprios favoritos"
  on public.favoritos for delete
  using (auth.uid() = user_id);

-- ---------- storage: bucket público "produtos" ----------
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

create policy "leitura publica das fotos de produtos"
  on storage.objects for select
  using (bucket_id = 'produtos');

create policy "admin envia fotos de produtos"
  on storage.objects for insert
  with check (bucket_id = 'produtos' and public.has_role(auth.uid(), 'admin'));

create policy "admin troca fotos de produtos"
  on storage.objects for update
  using (bucket_id = 'produtos' and public.has_role(auth.uid(), 'admin'));

create policy "admin apaga fotos de produtos"
  on storage.objects for delete
  using (bucket_id = 'produtos' and public.has_role(auth.uid(), 'admin'));
