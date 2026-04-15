export interface Experience {
  id: string
  title: string
  company: string
  period: string
  startYear: number
  endYear: number | null
  bullets: string[]
  technologies: string[]
}

export const experience: Experience[] = [
  {
    id: 'ams',
    title: 'Senior AI/Automation Engineer & Architect',
    company: 'Atlanta Media Services',
    period: 'Aug 2021 – Present',
    startYear: 2021,
    endYear: null,
    bullets: [
      'Architected and delivered a greenfield AI-augmented event management platform using React, TypeScript, Node.js, Django, PostgreSQL, and AWS',
      'Engineered automated event site deployment pipeline cutting provisioning time by 80% — replacing manual workflows with event-driven AWS Lambda, S3, and App Runner architecture',
      'Built real-time notification and alerting systems using AWS SNS, SES, and CloudWatch for proactive infrastructure observability',
      'Designed scalable microservices architecture with RESTful APIs, CI/CD pipelines, and zero-downtime release strategies',
      'Integrated Stripe payment processing with PCI-compliant security architecture and webhook event handling',
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'Django', 'PostgreSQL', 'AWS Lambda', 'S3', 'App Runner', 'SNS', 'SES', 'Stripe'],
  },
  {
    id: 'athlete-to-athlete',
    title: 'Senior Front-End Engineer',
    company: 'Athlete to Athlete',
    period: 'Feb 2025 – Jun 2025',
    startYear: 2025,
    endYear: 2025,
    bullets: [
      'Led full modernization of marketing and onboarding flows, rebuilding key pages as reusable React/Next.js modules',
      'Implemented component-driven UI architecture in Material UI with shared tokens, layout primitives, and form patterns',
      'Reworked authentication entry points and social sign-in UX to reduce onboarding friction',
      'Improved rendering performance via route-level code splitting, image optimization, and deferred loading, boosting Core Web Vitals',
      'Hardened responsive behavior and browser compatibility across mobile/desktop breakpoints',
    ],
    technologies: ['React', 'Next.js', 'TypeScript', 'Material UI', 'OAuth', 'Performance optimization'],
  },
  {
    id: 'veteran-crowd',
    title: 'Senior Front-End Engineer',
    company: 'Veteran Crowd',
    period: 'Oct 2024 – Jan 2025',
    startYear: 2024,
    endYear: 2025,
    bullets: [
      'Developed secure onboarding and account lifecycle features for a veteran-focused rewards platform',
      'Implemented military verification and MFA-enabled auth flows with resilient edge-case handling',
      'Built complex client-side state workflows with Redux for member profile, rewards, and transaction views',
      'Strengthened accessibility and compliance posture through semantic markup, keyboard navigability, and improved form validation',
    ],
    technologies: ['React', 'Next.js', 'TypeScript', 'Redux', 'Semantic UI', 'MFA/auth', 'WCAG'],
  },
  {
    id: 'wire-pulse',
    title: 'Senior Web Developer',
    company: 'Wire Pulse',
    period: 'Jun 2024 – Aug 2024',
    startYear: 2024,
    endYear: 2024,
    bullets: [
      'Engineered v2 of an operational admin platform for physical asset intelligence with scalable dashboard architecture',
      'Built high-density data interfaces for location, utilization, scheduling, and exception monitoring',
      'Executed zero-downtime migration from legacy data structures to a normalized schema',
      'Implemented near real-time event and status tracking pipelines for faster incident detection',
    ],
    technologies: ['React', 'Next.js', 'TypeScript', 'Real-time event handling', 'Schema migration'],
  },
  {
    id: 'shelton-ai',
    title: 'AI Software Engineer (Full Stack)',
    company: 'SheltonAI',
    period: 'Mar 2024 – Jun 2024',
    startYear: 2024,
    endYear: 2024,
    bullets: [
      'Built AI-driven product features for an institutional-grade private markets intelligence platform serving sovereign wealth funds, pensions, and endowments',
      'Designed NLP-driven processing pipelines to transform unstructured financial documents into normalized entities',
      'Built responsive Vue.js dashboards for portfolio performance, attribution, and KPI monitoring',
      'Integrated AI/ML model inference services with observability, retry logic, and failure-safe fallbacks',
    ],
    technologies: ['Python', 'Django', 'NLP pipelines', 'Vue.js', 'Analytics dashboards', 'Production ML'],
  },
  {
    id: 'tryon-creek',
    title: 'Senior React Developer',
    company: 'Tryon Creek Software (American Logistics)',
    period: 'Dec 2023 – Oct 2024',
    startYear: 2023,
    endYear: 2024,
    bullets: [
      'Delivered three internal logistics dashboards supporting transportation operations and dispatch visibility',
      'Architected a complex nine-step nested form engine with conditional branching and cross-step validation',
      'Built live tracking experiences for drivers and trip state transitions integrating external service providers',
      'Mentored junior developers through code reviews, pairing, and architecture guidance',
    ],
    technologies: ['React', 'TypeScript', 'Complex form architecture', 'API integrations', 'Real-time tracking'],
  },
  {
    id: 'lilt',
    title: 'Senior Web Developer',
    company: 'Lilt',
    period: 'Sep 2023 – Nov 2023',
    startYear: 2023,
    endYear: 2023,
    bullets: [
      'Rebuilt key marketing surfaces with a Next.js/TypeScript architecture for high-content velocity',
      'Implemented a clean migration path from Strapi to Contentful including content model alignment',
      'Reduced page load times by ~40% using targeted code splitting, static optimization, and image strategy improvements',
      'Implemented technical SEO enhancements including metadata consistency and structured content patterns',
    ],
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Contentful', 'Strapi', 'SEO'],
  },
  {
    id: 'iservice',
    title: 'Senior Web Developer',
    company: 'iService (DealerBuilt)',
    period: 'May 2022 – Sep 2023',
    startYear: 2022,
    endYear: 2023,
    bullets: [
      'Led development across a 20+ member agile team delivering multi-platform web and mobile solutions',
      'Built React Native applications with robust state architecture for service operations',
      'Implemented and scaled real-time communication features using WebSockets for live repair progress',
      'Rolled out a Material UI-based design system strategy, improving consistency and accelerating feature delivery',
    ],
    technologies: ['React Native', 'React', 'TypeScript', 'Material UI', 'WebSockets', 'Cross-platform state'],
  },
  {
    id: 'jmfa',
    title: 'Senior Front-End Engineer',
    company: 'JMFA',
    period: 'Mar 2022 – Jul 2022',
    startYear: 2022,
    endYear: 2022,
    bullets: [
      'Built core marketing and product-discovery experiences integrating React/TypeScript with C#/.NET backend services',
      'Embedded Power BI analytics modules for self-service stakeholder insights',
      'Implemented geolocation-driven personalization and segmentation features',
    ],
    technologies: ['React', 'TypeScript', 'Bootstrap', 'C#/.NET', 'Power BI', 'Geolocation'],
  },
  {
    id: 'surefront',
    title: 'Full Stack Developer',
    company: 'Surefront',
    period: 'Dec 2021 – Feb 2022',
    startYear: 2021,
    endYear: 2022,
    bullets: [
      'Extended core capabilities of a B2B commerce platform across catalog, merchandising, and order-management',
      'Optimized backend query patterns achieving ~30% database performance gains',
      'Improved API throughput through targeted Node.js service refactoring',
    ],
    technologies: ['React', 'Node.js', 'MongoDB', 'AWS', 'Query optimization'],
  },
  {
    id: 'smartsheet',
    title: 'Senior Front-End Engineer',
    company: 'Smartsheet',
    period: 'Mar 2014 – Dec 2020',
    startYear: 2014,
    endYear: 2020,
    bullets: [
      'Developed and maintained enterprise-level web applications across a 6+ year tenure at a globally recognized SaaS platform',
      'Mentored junior developers and led technical architecture decisions at scale',
    ],
    technologies: ['Enterprise JavaScript', 'React', 'Component systems', 'Architectural planning', 'Team mentorship'],
  },
]
