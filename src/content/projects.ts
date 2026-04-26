export interface Project {
  id: string
  title: string
  company: string
  period: string
  tagline: string
  problem: string
  contribution: string
  outcome: string
  techStack: string[]
  /** Public site URL — used as the source of truth for logo and live screenshot. */
  liveUrl: string
  /** Domain for Clearbit logo lookup. Defaults to the host of liveUrl. */
  logoDomain?: string
  /**
   * Brand color used as a fallback gradient when logos aren't available.
   * Two stops: from / to.
   */
  brand: { from: string; to: string }
  featured: boolean
}

/**
 * Live screenshot via WordPress mShots — free, no API key required.
 * The first request triggers a render, subsequent loads return the image.
 * Use a wide preset suitable for the macOS Finder card layout.
 */
export function projectScreenshotUrl(p: Project, w = 1280, h = 800): string {
  const encoded = encodeURIComponent(p.liveUrl)
  return `https://s.wordpress.com/mshots/v1/${encoded}?w=${w}&h=${h}`
}

/**
 * Logo via Clearbit — high-quality transparent PNG, returns 404 → fallback to favicon.
 */
export function projectLogoUrl(p: Project, size = 128): string {
  const domain =
    p.logoDomain ??
    (() => {
      try {
        return new URL(p.liveUrl).hostname.replace(/^www\./, '')
      } catch {
        return ''
      }
    })()
  return `https://logo.clearbit.com/${domain}?size=${size}`
}

/** Fallback to Google's favicon service if Clearbit fails. */
export function projectFaviconUrl(p: Project, size = 128): string {
  const domain =
    p.logoDomain ??
    (() => {
      try {
        return new URL(p.liveUrl).hostname.replace(/^www\./, '')
      } catch {
        return ''
      }
    })()
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
}

export const projects: Project[] = [
  {
    id: 'ams-platform',
    title: 'AI Event Management Platform',
    company: 'Atlanta Media Services',
    period: '2021 – Present',
    tagline: 'Greenfield AI-augmented platform that slashed deployment time by 80%',
    problem:
      'Manual deployment workflows made spinning up new event sites slow, error-prone, and bottlenecked by ops. The team needed a scalable, automated infrastructure layer.',
    contribution:
      'Architected the full platform from scratch — React/TypeScript frontend, Django backend, PostgreSQL, and a fully event-driven deployment pipeline using AWS Lambda, S3, and App Runner. Added real-time alerting via SNS/SES/CloudWatch and PCI-compliant Stripe payment processing.',
    outcome:
      '80% reduction in provisioning time. Zero-downtime deployments. Real-time infrastructure observability in production.',
    techStack: ['React', 'TypeScript', 'Node.js', 'Django', 'PostgreSQL', 'AWS Lambda', 'S3', 'App Runner', 'SNS', 'SES', 'Stripe', 'CI/CD'],
    liveUrl: 'https://atlantamediaservices.com',
    brand: { from: '#1e3a8a', to: '#0f172a' },
    featured: true,
  },
  {
    id: 'shelton-ai',
    title: 'Private Markets Intelligence Platform',
    company: 'SheltonAI',
    period: '2024',
    tagline: 'NLP pipelines transforming unstructured financial docs for sovereign wealth funds',
    problem:
      'Institutional investors needed real-time analytics from unstructured financial documents — PDFs, reports, filings — but no automated pipeline existed to normalize this data at scale.',
    contribution:
      'Designed and built NLP-driven processing pipelines in Python/Django to extract entities and analytics-ready records. Built Vue.js dashboards surfacing IRR, DPI, TVPI, and risk attribution in real time. Integrated ML inference services with retry logic and failure-safe fallbacks.',
    outcome:
      'Institutional-grade private markets intelligence platform in production serving sovereign wealth funds, pensions, and endowments.',
    techStack: ['Python', 'Django', 'NLP', 'Vue.js', 'ML inference', 'Analytics dashboards'],
    liveUrl: 'https://www.sheltonai.com',
    logoDomain: 'sheltonai.com',
    brand: { from: '#0891b2', to: '#0e7490' },
    featured: true,
  },
  {
    id: 'smartsheet',
    title: 'Enterprise SaaS Platform',
    company: 'Smartsheet',
    period: '2014 – 2020',
    tagline: '6+ years building enterprise web apps at a globally recognized SaaS platform',
    problem:
      'As Smartsheet scaled to millions of users, the frontend needed to handle increasing complexity, performance demands, and cross-team consistency.',
    contribution:
      'Built and maintained enterprise-level web applications across a 6+ year tenure. Mentored junior developers, led architecture decisions, and established component systems used across the platform.',
    outcome: 'A globally recognized SaaS platform with millions of users worldwide.',
    techStack: ['JavaScript', 'React', 'Component systems', 'Architecture', 'Team mentorship'],
    liveUrl: 'https://www.smartsheet.com',
    logoDomain: 'smartsheet.com',
    brand: { from: '#1877f2', to: '#0d4ea6' },
    featured: true,
  },
  {
    id: 'wire-pulse',
    title: 'Asset Intelligence Dashboard v2',
    company: 'Wire Pulse',
    period: '2024',
    tagline: 'Zero-downtime migration and real-time telemetry for physical asset operations',
    problem:
      'The legacy admin platform couldn\'t handle high-density telemetry data. Schema debt slowed feature delivery and the team needed real-time incident detection.',
    contribution:
      'Engineered v2 from the ground up — scalable dashboard architecture for telemetry-heavy workflows, high-density data tables with advanced sorting/filtering, and a zero-downtime migration from legacy schema to normalized data structures.',
    outcome: 'Near real-time status tracking, 0 production incidents during migration, improved operational response time.',
    techStack: ['React', 'Next.js', 'TypeScript', 'Real-time events', 'Schema migration', 'Data tables'],
    liveUrl: 'https://www.wirepulse.io',
    logoDomain: 'wirepulse.io',
    brand: { from: '#16a34a', to: '#065f46' },
    featured: true,
  },
  {
    id: 'american-logistics',
    title: 'Healthcare Logistics Operations Suite',
    company: 'American Logistics',
    period: '2023 – 2024',
    tagline: 'Three logistics dashboards with a 9-step form engine for healthcare transportation',
    problem:
      'Dispatch operations ran on disjointed tools with no unified visibility into driver state, trip transitions, or subscription workflows across nationwide healthcare transportation.',
    contribution:
      'Delivered three internal dashboards plus a nine-step nested form engine with conditional branching, cross-step validation, and save/resume. Integrated external service providers into a unified ops surface with live driver tracking.',
    outcome: 'Unified operational platform supporting nationwide healthcare transportation dispatch.',
    techStack: ['React', 'TypeScript', 'Complex forms', 'API integrations', 'Real-time tracking'],
    liveUrl: 'https://americanlogistics.com',
    logoDomain: 'americanlogistics.com',
    brand: { from: '#dc2626', to: '#7f1d1d' },
    featured: false,
  },
  {
    id: 'lilt',
    title: 'Enterprise Marketing Platform',
    company: 'Lilt',
    period: '2023',
    tagline: '40% page load reduction via Next.js migration and Strapi → Contentful move',
    problem:
      'High-traffic marketing pages were slow, hard to update, and running on a Strapi CMS that couldn\'t scale for global content velocity.',
    contribution:
      'Rebuilt key marketing surfaces in Next.js/TypeScript. Executed full Strapi → Contentful migration with schema alignment. Applied targeted code splitting, image optimization, and render-path simplification.',
    outcome: '~40% page load time reduction. Enterprise-grade scalability and global content publishing.',
    techStack: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Contentful', 'Strapi', 'SEO'],
    liveUrl: 'https://lilt.com',
    logoDomain: 'lilt.com',
    brand: { from: '#7c3aed', to: '#5b21b6' },
    featured: false,
  },
  {
    id: 'iservice',
    title: 'Multi-Platform Dealer Service Suite',
    company: 'iService (DealerBuilt)',
    period: '2022 – 2023',
    tagline: 'React Native + WebSockets across a 20+ person team for live dealer operations',
    problem:
      'Service tech, customer, and company views were siloed. Live repair status wasn\'t propagating correctly across web and mobile clients.',
    contribution:
      'Led development on a 20+ member team. Built React Native apps and WebSocket-powered real-time channels. Rolled out a Material UI design system and established bidirectional event reconciliation logic.',
    outcome: 'Unified multi-platform experience with live repair updates across all connected portals.',
    techStack: ['React Native', 'React', 'TypeScript', 'Material UI', 'WebSockets', 'Real-time messaging'],
    liveUrl: 'https://dealerbuilt.com/solutions/iservice/',
    logoDomain: 'dealerbuilt.com',
    brand: { from: '#f59e0b', to: '#b45309' },
    featured: false,
  },
  {
    id: 'veteran-crowd',
    title: 'Veteran Rewards Platform',
    company: 'VeteranCrowd',
    period: '2024 – 2025',
    tagline: 'MFA auth, military verification, and WCAG-compliant rewards experience',
    problem:
      'Veterans needed a trusted, accessible platform for rewards with strict identity validation and no tolerance for auth edge cases.',
    contribution:
      'Built secure onboarding with military verification and MFA. Implemented Redux state for profile/rewards/transactions. Hardened WCAG accessibility and compliance across all registration flows.',
    outcome: 'Production-grade veteran rewards platform with compliance posture and resilient auth.',
    techStack: ['React', 'Next.js', 'TypeScript', 'Redux', 'Semantic UI', 'MFA', 'WCAG'],
    liveUrl: 'https://www.veterancrowd.com/home',
    logoDomain: 'veterancrowd.com',
    brand: { from: '#1e40af', to: '#1e3a8a' },
    featured: false,
  },
]
