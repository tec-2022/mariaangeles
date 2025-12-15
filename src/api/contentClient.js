const hasLocalStorage = typeof window !== 'undefined' && window.localStorage;

const defaultData = {
  BlogPost: [
    {
      id: 'blog-1',
      title: 'Innovación y desarrollo regional',
      title_en: 'Innovation and Regional Development',
      excerpt: 'Reflexiones sobre cómo la innovación impulsa la competitividad territorial.',
      excerpt_en: 'Reflections on how innovation powers territorial competitiveness.',
      content: '<p>La investigación aplicada y la colaboración con la industria permiten crear ecosistemas resilientes.</p>',
      category: 'Innovación',
      cover_image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&q=80',
      created_date: '2024-12-01T10:00:00Z',
      published: true,
      featured: true
    },
    {
      id: 'blog-2',
      title: 'Economía del conocimiento en América Latina',
      title_en: 'Knowledge Economy in Latin America',
      excerpt: 'Un vistazo a las políticas públicas que aceleran la transferencia tecnológica.',
      excerpt_en: 'A look at public policies that accelerate technology transfer.',
      content: '<p>El fortalecimiento de capacidades y la vinculación con universidades son claves para el crecimiento sostenible.</p>',
      category: 'Desarrollo',
      cover_image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80',
      created_date: '2024-11-10T10:00:00Z',
      published: true,
      featured: false
    }
  ],
  Event: [
    {
      id: 'event-1',
      title: 'Seminario de competitividad regional',
      title_en: 'Regional Competitiveness Seminar',
      description: 'Encuentro con líderes académicos y empresariales para compartir mejores prácticas.',
      description_en: 'Meeting with academic and industry leaders to share best practices.',
      date: '2025-02-15T17:00:00Z',
      created_date: '2024-12-15T10:00:00Z',
      is_upcoming: true,
      location: 'Tijuana, México'
    }
  ],
  Publication: [
    {
      id: 'pub-1',
      title: 'Estrategias de innovación para economías regionales',
      title_en: 'Innovation Strategies for Regional Economies',
      authors: 'M. Ángeles Quezada',
      year: 2024,
      publication_type: 'Artículo',
      abstract: 'Análisis de modelos de innovación aplicada a contextos fronterizos.',
      link: '#',
      created_date: '2024-10-10T10:00:00Z'
    },
    {
      id: 'pub-2',
      title: 'Gobernanza y desarrollo sostenible',
      title_en: 'Governance and Sustainable Development',
      authors: 'M. Ángeles Quezada',
      year: 2023,
      publication_type: 'Libro',
      abstract: 'Buenas prácticas de colaboración entre academia, gobierno y sociedad civil.',
      link: '#',
      created_date: '2023-08-15T10:00:00Z'
    }
  ],
  PodcastEpisode: [
    {
      id: 'pod-1',
      title: 'Innovación abierta con impacto social',
      title_en: 'Open Innovation with Social Impact',
      episode_number: 1,
      description: 'Conversación sobre proyectos que conectan ciencia y comunidad.',
      description_en: 'Conversation about projects that connect science and community.',
      audio_url: '#',
      date: '2024-09-01T10:00:00Z',
      published: true
    }
  ],
  NewsItem: [
    {
      id: 'news-1',
      title: 'Nueva colaboración internacional',
      title_en: 'New international collaboration',
      badge_color: '#db2777',
      summary: 'Se firma un acuerdo para impulsar la transferencia tecnológica binacional.',
      summary_en: 'An agreement to boost cross-border technology transfer was signed.',
      date: '2024-12-05T10:00:00Z',
      link: '#',
      published: true
    }
  ],
  SiteSettings: [
    { id: 'stats-citations', key: 'citations', value: '1,250', category: 'stats' },
    { id: 'stats-publications', key: 'publications', value: '60', category: 'stats' },
    { id: 'stats-thesis_directed', key: 'thesis_directed', value: '22', category: 'stats' },
    { id: 'stats-podcast_listeners', key: 'podcast_listeners', value: '48', category: 'stats' },
    { id: 'stats-research_projects', key: 'research_projects', value: '14', category: 'stats' },
    { id: 'stats-thesis_doctorate_progress', key: 'thesis_doctorate_progress', value: '3', category: 'stats' },
    { id: 'stats-thesis_masters_progress', key: 'thesis_masters_progress', value: '4', category: 'stats' },
    { id: 'stats-thesis_undergrad_progress', key: 'thesis_undergrad_progress', value: '6', category: 'stats' },
    { id: 'stats-thesis_doctorate_graduated', key: 'thesis_doctorate_graduated', value: '2', category: 'stats' },
    { id: 'stats-thesis_masters_graduated', key: 'thesis_masters_graduated', value: '3', category: 'stats' },
    { id: 'stats-thesis_undergrad_graduated', key: 'thesis_undergrad_graduated', value: '4', category: 'stats' },
    { id: 'pages-home', key: 'home_title', value: 'María Ángeles Quezada', category: 'pages' },
    { id: 'theme', key: 'seasonal_theme', value: 'spring', category: 'theme' },
    { id: 'profile-photo', key: 'profile_photo', value: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80', category: 'profile' },
    { id: 'profile-cv', key: 'cv_url', value: '#', category: 'profile' },
    { id: 'contact-email', key: 'contact_notification_email', value: 'equipo@example.com', category: 'notifications' },
    { id: 'contact-cc', key: 'contact_cc_email', value: 'contacto@example.com', category: 'notifications' },
    { id: 'blog-readers', key: 'blog_readers', value: '2,400', category: 'stats' },
    { id: 'blog-articles', key: 'blog_articles', value: '28', category: 'stats' },
    { id: 'blog-categories', key: 'blog_categories', value: '6', category: 'stats' }
  ],
  AboutContent: [
    { id: 'about-1', section: 'position', title: 'Profesora Investigadora', description: 'Especialista en competitividad y economía del conocimiento.', order: 1, is_current: true },
    { id: 'about-2', section: 'education', title: 'Doctorado en Gestión', description: 'Tecnológico de Tijuana', order: 1 },
    { id: 'about-3', section: 'honor', title: 'Reconocimiento a la Innovación', description: 'Premio nacional por liderazgo académico.', order: 1 }
  ],
  SocialLink: [
    { id: 'social-1', platform: 'LinkedIn', url: 'https://www.linkedin.com', icon: 'linkedin', active: true, order: 1 },
    { id: 'social-2', platform: 'ResearchGate', url: 'https://www.researchgate.net', icon: 'star', active: true, order: 2 }
  ],
  Researcher: [
    {
      id: 'researcher-1',
      name: 'María Ángeles Quezada',
      title: 'Investigadora Principal',
      title_en: 'Lead Researcher',
      specialty: 'Competitividad regional y políticas de innovación',
      specialty_en: 'Regional competitiveness and innovation policy',
      bio: 'Impulsa proyectos que conectan academia, industria y gobierno.',
      institution: 'Instituto Tecnológico de Tijuana',
      email: 'investigacion@example.com',
      linkedin: 'https://www.linkedin.com',
      researchgate: 'https://www.researchgate.net',
      is_principal: true,
      order: 1,
      photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80'
    },
    {
      id: 'researcher-2',
      name: 'Juan Pérez',
      title: 'Colaborador',
      specialty: 'Economía del conocimiento',
      institution: 'Universidad Autónoma de Baja California',
      email: 'jperez@example.com',
      linkedin: 'https://www.linkedin.com',
      is_principal: false,
      order: 2,
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80'
    }
  ],
  Course: [
    { id: 'course-1', title: 'Políticas Públicas para la Innovación', description: 'Curso sobre diseño de políticas de ciencia y tecnología.', created_date: '2024-09-01T10:00:00Z' }
  ],
  ResearchProject: [
    {
      id: 'project-1',
      title: 'Laboratorio de Innovación Fronteriza',
      title_en: 'Border Innovation Lab',
      description: 'Proyecto multidisciplinario para detonar innovación en la región.',
      description_en: 'Multidisciplinary project to ignite innovation in the region.',
      status: 'current',
      period: '2024-2025',
      institution: 'Instituto Tecnológico de Tijuana',
      funding: 'Fondos internos',
      research_line: 'innovation',
      order: 1
    }
  ],
  ResearchLine: [
    { id: 'line-1', title: 'Innovación y Competitividad', description: 'Estrategias para ecosistemas de innovación.', icon: 'Lightbulb', tags: 'innovación, competitividad', visible: true, order: 1 },
    { id: 'line-2', title: 'Desarrollo Regional', description: 'Modelos de crecimiento sostenible.', icon: 'Globe', tags: 'región, economía', visible: true, order: 2 }
  ],
  Institution: [
    { id: 'inst-1', name: 'Instituto Tecnológico de Tijuana', description: 'Colaboración académica y proyectos conjuntos.', visible: true, order: 1 }
  ],
  GalleryImage: [
    { id: 'gallery-1', title: 'Conferencia magistral', url: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=900&q=80', order: 1 }
  ],
  GalleryAlbum: [],
  Certificate: [
    { id: 'cert-1', title: 'Premio a la Investigación', description: 'Reconocimiento por contribuciones académicas.', visible: true }
  ],
  Comment: [],
  AnalyticsEvent: [],
  ContactMessage: [],
  Subscriber: [],
  User: [
    { id: 'user-1', email: 'admin@example.com', name: 'Equipo editorial' }
  ]
};

const loadData = () => {
  if (hasLocalStorage) {
    const raw = window.localStorage.getItem('content-api');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return { ...defaultData, ...parsed };
      } catch (err) {
        console.warn('No se pudo leer el estado guardado, usando datos por defecto.', err);
      }
    }
  }
  return typeof structuredClone === 'function' ? structuredClone(defaultData) : JSON.parse(JSON.stringify(defaultData));
};

let dataStore = loadData();
let idCounter = 1000;

const persist = () => {
  if (hasLocalStorage) {
    window.localStorage.setItem('content-api', JSON.stringify(dataStore));
  }
};

const generateId = (prefix) => {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
};

const sortAndLimit = (items, orderBy, limit) => {
  if (orderBy) {
    const desc = orderBy.startsWith('-');
    const key = desc ? orderBy.slice(1) : orderBy;
    items.sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal === bVal) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;
      return desc ? (aVal < bVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
    });
  }

  if (limit) {
    return items.slice(0, limit);
  }

  return items;
};

const matches = (item, criteria = {}) => {
  return Object.entries(criteria).every(([key, value]) => {
    if (value === undefined || value === null) return true;
    return item[key] === value;
  });
};

const createEntityApi = (entityName) => ({
  list: async (orderBy, limit) => sortAndLimit([...dataStore[entityName]], orderBy, limit),
  filter: async (criteria = {}, orderBy, limit) => sortAndLimit(dataStore[entityName].filter(item => matches(item, criteria)), orderBy, limit),
  get: async (id) => dataStore[entityName].find(item => item.id === id),
  create: async (payload) => {
    const newItem = {
      id: generateId(entityName.toLowerCase()),
      created_date: new Date().toISOString(),
      ...payload
    };
    dataStore[entityName].push(newItem);
    persist();
    return newItem;
  },
  update: async (id, updates) => {
    const idx = dataStore[entityName].findIndex(item => item.id === id);
    if (idx === -1) return null;
    dataStore[entityName][idx] = { ...dataStore[entityName][idx], ...updates };
    persist();
    return dataStore[entityName][idx];
  },
  delete: async (id) => {
    dataStore[entityName] = dataStore[entityName].filter(item => item.id !== id);
    persist();
    return { success: true };
  }
});

const defaultUser = { id: 'user-1', email: 'admin@example.com', name: 'Equipo editorial' };
const authKey = 'content-api-user';

const auth = {
  async isAuthenticated() {
    if (hasLocalStorage) {
      const stored = window.localStorage.getItem(authKey);
      if (stored) return true;
      window.localStorage.setItem(authKey, JSON.stringify(defaultUser));
      return true;
    }
    return true;
  },
  async me() {
    if (hasLocalStorage) {
      const raw = window.localStorage.getItem(authKey);
      return raw ? JSON.parse(raw) : defaultUser;
    }
    return defaultUser;
  },
  async logout(redirectTo = '/') {
    if (hasLocalStorage) {
      window.localStorage.removeItem(authKey);
    }
    if (typeof window !== 'undefined' && redirectTo) {
      window.location.assign(redirectTo);
    }
  },
  redirectToLogin(returnUrl = '/') {
    if (typeof window !== 'undefined') {
      window.location.assign(returnUrl);
    }
  }
};

const integrations = {
  Core: {
    async InvokeLLM({ prompt }) {
      return {
        content: `Respuesta simulada para: ${prompt?.slice(0, 80) || 'consulta'}`
      };
    },
    async SendEmail({ to, subject, body }) {
      console.info('Simulación de envío de email', { to, subject, body });
      return { success: true };
    },
    async UploadFile({ file }) {
      const fileName = file?.name || 'archivo';
      return { file_url: `https://files.example.com/${fileName}` };
    },
    async GenerateImage({ prompt }) {
      return { image_url: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=80&sig=${encodeURIComponent(prompt || '')}` };
    },
    async ExtractDataFromUploadedFile({ file }) {
      return { text: `Contenido extraído del archivo ${file?.name || 'adjunto'}` };
    },
    async CreateFileSignedUrl() {
      return { upload_url: 'https://files.example.com/upload', file_url: 'https://files.example.com/generated-file' };
    },
    async UploadPrivateFile({ file }) {
      const fileName = file?.name || 'privado';
      return { file_url: `https://files.example.com/private/${fileName}` };
    }
  }
};

export const contentClient = {
  auth,
  entities: Object.fromEntries(Object.keys(defaultData).map((key) => [key, createEntityApi(key)])),
  integrations
};

export default contentClient;
