export type SkillLevel = 'expert' | 'strong' | 'proficient'

export interface SkillGroup {
  category: string
  icon: string
  skills: { name: string; level: SkillLevel }[]
}

export const skillGroups: SkillGroup[] = [
  {
    category: 'AI & Automation',
    icon: '🤖',
    skills: [
      { name: 'LLM Integration', level: 'expert' },
      { name: 'NLP Pipelines', level: 'expert' },
      { name: 'RAG Systems', level: 'expert' },
      { name: 'OpenAI APIs', level: 'expert' },
      { name: 'TensorFlow / PyTorch', level: 'strong' },
      { name: 'Intelligent Workflow Automation', level: 'expert' },
      { name: 'Event-Driven Architecture', level: 'expert' },
    ],
  },
  {
    category: 'Frontend',
    icon: '🖥',
    skills: [
      { name: 'React', level: 'expert' },
      { name: 'Next.js', level: 'expert' },
      { name: 'TypeScript', level: 'expert' },
      { name: 'Vue.js / Nuxt.js', level: 'strong' },
      { name: 'React Native / Expo', level: 'strong' },
      { name: 'Flutter', level: 'proficient' },
      { name: 'Tailwind CSS', level: 'expert' },
      { name: 'Material UI / Semantic UI', level: 'expert' },
      { name: 'Framer Motion', level: 'strong' },
    ],
  },
  {
    category: 'Backend',
    icon: '⚙️',
    skills: [
      { name: 'Node.js', level: 'expert' },
      { name: 'NestJS', level: 'expert' },
      { name: 'Python / Django / Flask', level: 'expert' },
      { name: 'Express.js', level: 'expert' },
      { name: '.NET / C#', level: 'strong' },
      { name: 'GraphQL', level: 'strong' },
      { name: 'RESTful APIs', level: 'expert' },
      { name: 'WebSockets', level: 'expert' },
    ],
  },
  {
    category: 'Cloud & DevOps',
    icon: '☁️',
    skills: [
      { name: 'AWS (EC2, Lambda, S3, App Runner)', level: 'expert' },
      { name: 'AWS (RDS, DynamoDB, CloudFront)', level: 'expert' },
      { name: 'AWS SNS / SES / CloudWatch', level: 'expert' },
      { name: 'Docker', level: 'expert' },
      { name: 'Kubernetes', level: 'strong' },
      { name: 'GitHub Actions / Jenkins', level: 'expert' },
      { name: 'CI/CD Pipeline Design', level: 'expert' },
      { name: 'Azure / GCP', level: 'proficient' },
    ],
  },
  {
    category: 'Databases',
    icon: '🗄',
    skills: [
      { name: 'PostgreSQL', level: 'expert' },
      { name: 'MongoDB', level: 'expert' },
      { name: 'Redis', level: 'strong' },
      { name: 'MySQL', level: 'expert' },
      { name: 'Supabase', level: 'strong' },
      { name: 'DynamoDB', level: 'strong' },
      { name: 'ElastiCache', level: 'strong' },
    ],
  },
  {
    category: 'Integrations & Tools',
    icon: '🔧',
    skills: [
      { name: 'Stripe (PCI-compliant)', level: 'expert' },
      { name: 'Contentful / Strapi', level: 'expert' },
      { name: 'SendGrid', level: 'strong' },
      { name: 'Power BI', level: 'strong' },
      { name: 'Cypress / Jest', level: 'expert' },
      { name: 'Playwright', level: 'strong' },
      { name: 'Jira / Linear / Asana', level: 'expert' },
    ],
  },
]

export const levelColors: Record<SkillLevel, string> = {
  expert: '#22c55e',
  strong: '#eab308',
  proficient: '#60a5fa',
}

export const levelLabels: Record<SkillLevel, string> = {
  expert: 'Expert',
  strong: 'Strong',
  proficient: 'Proficient',
}
