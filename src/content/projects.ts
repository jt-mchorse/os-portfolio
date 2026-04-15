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
  liveUrl?: string
  screenshot: string
  featured: boolean
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
    screenshot: '/project-screenshots/ams-platform.png',
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
    screenshot: '/project-screenshots/shelton-ai.png',
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
    liveUrl: 'https://smartsheet.com',
    screenshot: '/project-screenshots/smartsheet.png',
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
    screenshot: '/project-screenshots/wire-pulse.png',
    featured: true,
  },
  {
    id: 'american-logistics',
    title: 'Healthcare Logistics Operations Suite',
    company: 'Tryon Creek / American Logistics',
    period: '2023 – 2024',
    tagline: 'Three logistics dashboards with a 9-step form engine for healthcare transportation',
    problem:
      'Dispatch operations ran on disjointed tools with no unified visibility into driver state, trip transitions, or subscription workflows across nationwide healthcare transportation.',
    contribution:
      'Delivered three internal dashboards plus a nine-step nested form engine with conditional branching, cross-step validation, and save/resume. Integrated external service providers into a unified ops surface with live driver tracking.',
    outcome: 'Unified operational platform supporting nationwide healthcare transportation dispatch.',
    techStack: ['React', 'TypeScript', 'Complex forms', 'API integrations', 'Real-time tracking'],
    screenshot: '/project-screenshots/american-logistics.png',
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
    screenshot: '/project-screenshots/lilt.png',
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
    screenshot: '/project-screenshots/iservice.png',
    featured: false,
  },
  {
    id: 'veteran-crowd',
    title: 'Veteran Rewards Platform',
    company: 'Veteran Crowd',
    period: '2024 – 2025',
    tagline: 'MFA auth, military verification, and WCAG-compliant rewards experience',
    problem:
      'Veterans needed a trusted, accessible platform for rewards with strict identity validation and no tolerance for auth edge cases.',
    contribution:
      'Built secure onboarding with military verification and MFA. Implemented Redux state for profile/rewards/transactions. Hardened WCAG accessibility and compliance across all registration flows.',
    outcome: 'Production-grade veteran rewards platform with compliance posture and resilient auth.',
    techStack: ['React', 'Next.js', 'TypeScript', 'Redux', 'Semantic UI', 'MFA', 'WCAG'],
    screenshot: '/project-screenshots/veteran-crowd.png',
    featured: false,
  },
]
