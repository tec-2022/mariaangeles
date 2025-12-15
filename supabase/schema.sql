-- Supabase database schema for María Ángeles Quezada site
-- Run this script in the Supabase SQL editor or with psql after creating your project.

-- Extensions
create extension if not exists "pgcrypto";

-- Blog posts
create table if not exists public.blog_posts (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  title text not null,
  title_en text,
  slug text,
  category text,
  excerpt text,
  excerpt_en text,
  content text,
  cover_image text,
  created_date timestamptz not null default now(),
  published boolean not null default false,
  featured boolean not null default false,
  likes integer not null default 0,
  views integer not null default 0
);
create unique index if not exists blog_posts_slug_idx on public.blog_posts(slug);
create index if not exists blog_posts_created_date_idx on public.blog_posts(created_date desc);

-- Events
create table if not exists public.events (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  title text not null,
  title_en text,
  description text,
  description_en text,
  date timestamptz,
  created_date timestamptz not null default now(),
  is_upcoming boolean not null default false,
  location text,
  type text,
  image text,
  link text,
  featured boolean not null default false
);
create index if not exists events_date_idx on public.events(date desc);

-- Publications
create table if not exists public.publications (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  title text not null,
  title_en text,
  type text,
  year integer,
  authors text,
  journal text,
  doi text,
  abstract text,
  pdf_url text,
  link text,
  created_date timestamptz not null default now(),
  publication_type text,
  indexation text
);
create index if not exists publications_year_idx on public.publications(year desc);

-- Podcast episodes
create table if not exists public.podcast_episodes (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  title text not null,
  title_en text,
  episode_number integer,
  duration text,
  description text,
  description_en text,
  audio_url text,
  spotify_url text,
  youtube_url text,
  apple_url text,
  date timestamptz,
  created_date timestamptz not null default now(),
  published boolean not null default false,
  guest_name text,
  guest_title text,
  featured boolean not null default false
);
create index if not exists podcast_episodes_date_idx on public.podcast_episodes(date desc);

-- News items
create table if not exists public.news_items (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  title text not null,
  title_en text,
  type text,
  badge_color text,
  summary text,
  summary_en text,
  date timestamptz,
  link text,
  created_date timestamptz not null default now(),
  published boolean not null default false,
  featured boolean not null default false
);
create index if not exists news_items_date_idx on public.news_items(date desc);

-- Site settings
create table if not exists public.site_settings (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  key text not null,
  value text,
  category text not null default 'general',
  created_date timestamptz not null default now()
);
create index if not exists site_settings_category_idx on public.site_settings(category);

-- About content
create table if not exists public.about_content (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  section text not null,
  title text not null,
  subtitle text,
  description text,
  period text,
  institution text,
  is_current boolean not null default false,
  "order" integer not null default 0,
  created_date timestamptz not null default now()
);
create index if not exists about_content_section_idx on public.about_content(section, "order");

-- Social links
create table if not exists public.social_links (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  platform text not null,
  url text not null,
  icon text,
  active boolean not null default true,
  "order" integer not null default 0,
  created_date timestamptz not null default now()
);
create index if not exists social_links_order_idx on public.social_links("order");

-- Researchers
create table if not exists public.researchers (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  name text not null,
  title text,
  title_en text,
  specialty text,
  specialty_en text,
  bio text,
  institution text,
  email text,
  linkedin text,
  researchgate text,
  is_principal boolean not null default false,
  "order" integer not null default 0,
  photo text,
  created_date timestamptz not null default now()
);
create index if not exists researchers_order_idx on public.researchers("order");

-- Courses
create table if not exists public.courses (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  title text not null,
  description text,
  level text,
  period text,
  institution text,
  students integer,
  is_current boolean not null default false,
  created_date timestamptz not null default now()
);
create index if not exists courses_created_date_idx on public.courses(created_date desc);

-- Research projects
create table if not exists public.research_projects (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  title text not null,
  title_en text,
  description text,
  description_en text,
  status text,
  period text,
  institution text,
  funding text,
  research_line text,
  "order" integer not null default 0,
  created_date timestamptz not null default now()
);
create index if not exists research_projects_order_idx on public.research_projects("order");

-- Research lines
create table if not exists public.research_lines (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  title text not null,
  description text,
  icon text,
  tags text,
  visible boolean not null default true,
  "order" integer not null default 0,
  created_date timestamptz not null default now()
);
create index if not exists research_lines_order_idx on public.research_lines("order");

-- Institutions
create table if not exists public.institutions (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  name text not null,
  role text,
  location text,
  status text,
  description text,
  visible boolean not null default true,
  "order" integer not null default 0,
  created_date timestamptz not null default now()
);
create index if not exists institutions_order_idx on public.institutions("order");

-- Gallery albums
create table if not exists public.gallery_albums (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  title text not null,
  description text,
  event_name text,
  date timestamptz,
  location text,
  category text,
  cover_image text,
  "order" integer not null default 0,
  created_date timestamptz not null default now()
);
create index if not exists gallery_albums_order_idx on public.gallery_albums("order");

-- Gallery images
create table if not exists public.gallery_images (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  title text not null,
  description text,
  album_id text references public.gallery_albums(id) on delete set null,
  category text,
  image_url text,
  date timestamptz,
  location text,
  "order" integer not null default 0,
  created_date timestamptz not null default now()
);
create index if not exists gallery_images_album_idx on public.gallery_images(album_id, "order");

-- Certificates
create table if not exists public.certificates (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  title text not null,
  type text,
  issuer text,
  description text,
  date timestamptz,
  year integer,
  pdf_url text,
  visible boolean not null default true,
  created_date timestamptz not null default now()
);

-- Comments
create table if not exists public.comments (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  post_id text references public.blog_posts(id) on delete cascade,
  name text,
  email text,
  content text,
  approved boolean not null default false,
  created_date timestamptz not null default now()
);
create index if not exists comments_post_id_idx on public.comments(post_id);
create index if not exists comments_approved_idx on public.comments(approved);

-- Contact messages
create table if not exists public.contact_messages (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  name text,
  email text,
  subject text,
  message text,
  read boolean not null default false,
  replied boolean not null default false,
  archived boolean not null default false,
  created_date timestamptz not null default now()
);
create index if not exists contact_messages_read_idx on public.contact_messages(read, replied, archived);

-- Subscribers
create table if not exists public.subscribers (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  email text not null,
  active boolean not null default true,
  source text default 'blog',
  created_date timestamptz not null default now()
);
create index if not exists subscribers_email_idx on public.subscribers(email);

-- Analytics events
create table if not exists public.analytics_events (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  event_type text,
  page text,
  content_id text,
  content_title text,
  session_id text,
  metadata jsonb,
  created_date timestamptz not null default now()
);
create index if not exists analytics_events_type_idx on public.analytics_events(event_type);
create index if not exists analytics_events_created_idx on public.analytics_events(created_date desc);

-- Users (admin/editor identities)
create table if not exists public.users (
  id text primary key default encode(gen_random_bytes(8), 'hex'),
  email text not null,
  name text,
  role text default 'editor',
  created_date timestamptz not null default now()
);
create index if not exists users_email_idx on public.users(email);

-- Seed data matching the local content client defaults
insert into public.blog_posts (id, title, title_en, excerpt, excerpt_en, content, category, cover_image, created_date, published, featured)
values
  ('blog-1', 'Innovación y desarrollo regional', 'Innovation and Regional Development', 'Reflexiones sobre cómo la innovación impulsa la competitividad territorial.', 'Reflections on how innovation powers territorial competitiveness.', '<p>La investigación aplicada y la colaboración con la industria permiten crear ecosistemas resilientes.</p>', 'Innovación', 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&q=80', '2024-12-01T10:00:00Z', true, true),
  ('blog-2', 'Economía del conocimiento en América Latina', 'Knowledge Economy in Latin America', 'Un vistazo a las políticas públicas que aceleran la transferencia tecnológica.', 'A look at public policies that accelerate technology transfer.', '<p>El fortalecimiento de capacidades y la vinculación con universidades son claves para el crecimiento sostenible.</p>', 'Desarrollo', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80', '2024-11-10T10:00:00Z', true, false)
on conflict (id) do nothing;

insert into public.events (id, title, title_en, description, description_en, date, created_date, is_upcoming, location)
values
  ('event-1', 'Seminario de competitividad regional', 'Regional Competitiveness Seminar', 'Encuentro con líderes académicos y empresariales para compartir mejores prácticas.', 'Meeting with academic and industry leaders to share best practices.', '2025-02-15T17:00:00Z', '2024-12-15T10:00:00Z', true, 'Tijuana, México')
on conflict (id) do nothing;

insert into public.publications (id, title, title_en, authors, year, publication_type, abstract, link, created_date)
values
  ('pub-1', 'Estrategias de innovación para economías regionales', 'Innovation Strategies for Regional Economies', 'M. Ángeles Quezada', 2024, 'Artículo', 'Análisis de modelos de innovación aplicada a contextos fronterizos.', '#', '2024-10-10T10:00:00Z'),
  ('pub-2', 'Gobernanza y desarrollo sostenible', 'Governance and Sustainable Development', 'M. Ángeles Quezada', 2023, 'Libro', 'Buenas prácticas de colaboración entre academia, gobierno y sociedad civil.', '#', '2023-08-15T10:00:00Z')
on conflict (id) do nothing;

insert into public.podcast_episodes (id, title, title_en, episode_number, description, description_en, audio_url, date, published)
values
  ('pod-1', 'Innovación abierta con impacto social', 'Open Innovation with Social Impact', 1, 'Conversación sobre proyectos que conectan ciencia y comunidad.', 'Conversation about projects that connect science and community.', '#', '2024-09-01T10:00:00Z', true)
on conflict (id) do nothing;

insert into public.news_items (id, title, title_en, badge_color, summary, summary_en, date, link, published)
values
  ('news-1', 'Nueva colaboración internacional', 'New international collaboration', '#db2777', 'Se firma un acuerdo para impulsar la transferencia tecnológica binacional.', 'An agreement to boost cross-border technology transfer was signed.', '2024-12-05T10:00:00Z', '#', true)
on conflict (id) do nothing;

insert into public.site_settings (id, key, value, category) values
  ('stats-citations', 'citations', '1,250', 'stats'),
  ('stats-publications', 'publications', '60', 'stats'),
  ('stats-thesis_directed', 'thesis_directed', '22', 'stats'),
  ('stats-podcast_listeners', 'podcast_listeners', '48', 'stats'),
  ('stats-research_projects', 'research_projects', '14', 'stats'),
  ('stats-thesis_doctorate_progress', 'thesis_doctorate_progress', '3', 'stats'),
  ('stats-thesis_masters_progress', 'thesis_masters_progress', '4', 'stats'),
  ('stats-thesis_undergrad_progress', 'thesis_undergrad_progress', '6', 'stats'),
  ('stats-thesis_doctorate_graduated', 'thesis_doctorate_graduated', '2', 'stats'),
  ('stats-thesis_masters_graduated', 'thesis_masters_graduated', '3', 'stats'),
  ('stats-thesis_undergrad_graduated', 'thesis_undergrad_graduated', '4', 'stats'),
  ('pages-home', 'home_title', 'María Ángeles Quezada', 'pages'),
  ('theme', 'seasonal_theme', 'spring', 'theme'),
  ('profile-photo', 'profile_photo', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80', 'profile'),
  ('profile-cv', 'cv_url', '#', 'profile'),
  ('contact-email', 'contact_notification_email', 'equipo@example.com', 'notifications'),
  ('contact-cc', 'contact_cc_email', 'contacto@example.com', 'notifications'),
  ('blog-readers', 'blog_readers', '2,400', 'stats'),
  ('blog-articles', 'blog_articles', '28', 'stats'),
  ('blog-categories', 'blog_categories', '6', 'stats')
on conflict (id) do nothing;

insert into public.about_content (id, section, title, description, "order", is_current)
values
  ('about-1', 'position', 'Profesora Investigadora', 'Especialista en competitividad y economía del conocimiento.', 1, true),
  ('about-2', 'education', 'Doctorado en Gestión', 'Tecnológico de Tijuana', 1, false),
  ('about-3', 'honor', 'Reconocimiento a la Innovación', 'Premio nacional por liderazgo académico.', 1, false)
on conflict (id) do nothing;

insert into public.social_links (id, platform, url, icon, active, "order")
values
  ('social-1', 'LinkedIn', 'https://www.linkedin.com', 'linkedin', true, 1),
  ('social-2', 'ResearchGate', 'https://www.researchgate.net', 'star', true, 2)
on conflict (id) do nothing;

insert into public.researchers (id, name, title, title_en, specialty, specialty_en, bio, institution, email, linkedin, researchgate, is_principal, "order", photo)
values
  ('researcher-1', 'María Ángeles Quezada', 'Investigadora Principal', 'Lead Researcher', 'Competitividad regional y políticas de innovación', 'Regional competitiveness and innovation policy', 'Impulsa proyectos que conectan academia, industria y gobierno.', 'Instituto Tecnológico de Tijuana', 'investigacion@example.com', 'https://www.linkedin.com', 'https://www.researchgate.net', true, 1, 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80'),
  ('researcher-2', 'Juan Pérez', 'Colaborador', null, 'Economía del conocimiento', null, null, 'Universidad Autónoma de Baja California', 'jperez@example.com', 'https://www.linkedin.com', null, false, 2, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80')
on conflict (id) do nothing;

insert into public.courses (id, title, description, created_date)
values
  ('course-1', 'Políticas Públicas para la Innovación', 'Curso sobre diseño de políticas de ciencia y tecnología.', '2024-09-01T10:00:00Z')
on conflict (id) do nothing;

insert into public.research_projects (id, title, title_en, description, description_en, status, period, institution, funding, research_line, "order")
values
  ('project-1', 'Laboratorio de Innovación Fronteriza', 'Border Innovation Lab', 'Proyecto multidisciplinario para detonar innovación en la región.', 'Multidisciplinary project to ignite innovation in the region.', 'current', '2024-2025', 'Instituto Tecnológico de Tijuana', 'Fondos internos', 'innovation', 1)
on conflict (id) do nothing;

insert into public.research_lines (id, title, description, icon, tags, visible, "order")
values
  ('line-1', 'Innovación y Competitividad', 'Estrategias para ecosistemas de innovación.', 'Lightbulb', 'innovación, competitividad', true, 1),
  ('line-2', 'Desarrollo Regional', 'Modelos de crecimiento sostenible.', 'Globe', 'región, economía', true, 2)
on conflict (id) do nothing;

insert into public.institutions (id, name, description, visible, "order")
values
  ('inst-1', 'Instituto Tecnológico de Tijuana', 'Colaboración académica y proyectos conjuntos.', true, 1)
on conflict (id) do nothing;

insert into public.gallery_images (id, title, url, "order")
values
  ('gallery-1', 'Conferencia magistral', 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=900&q=80', 1)
on conflict (id) do nothing;

insert into public.certificates (id, title, description, visible)
values
  ('cert-1', 'Premio a la Investigación', 'Reconocimiento por contribuciones académicas.', true)
on conflict (id) do nothing;

insert into public.users (id, email, name, role)
values
  ('user-1', 'admin@example.com', 'Equipo editorial', 'admin')
on conflict (id) do nothing;
