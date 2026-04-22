// Curated skill dictionary organized by category
// Used for keyword-based ATS scoring and skill extraction

export const SKILL_DICTIONARY: Record<string, string[]> = {
  'Programming Languages': [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'golang', 'rust',
    'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'lua',
    'dart', 'elixir', 'clojure', 'haskell', 'objective-c', 'assembly', 'sql', 'nosql', 'bash',
    'shell scripting', 'powershell', 'groovy', 'visual basic', 'cobol', 'fortran',
  ],
  'Frontend': [
    'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs', 'vue.js',
    'svelte', 'sveltekit', 'next.js', 'nextjs', 'nuxt', 'nuxt.js', 'gatsby', 'remix', 'astro',
    'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwind', 'tailwindcss',
    'bootstrap', 'material ui', 'mui', 'joy ui', 'chakra ui', 'ant design', 'shadcn',
    'styled-components', 'emotion',
    'webpack', 'vite', 'rollup', 'parcel', 'babel', 'esbuild', 'turbopack',
    'jquery', 'redux', 'zustand', 'mobx', 'recoil', 'jotai', 'tanstack',
    'storybook', 'chromatic', 'figma', 'responsive design', 'web accessibility', 'a11y',
    'pwa', 'progressive web app', 'single page application', 'spa', 'ssr',
    'server side rendering',
  ],
  'Backend': [
    'node.js', 'nodejs', 'express', 'expressjs', 'fastify', 'nestjs', 'koa', 'hapi',
    'django', 'flask', 'fastapi', 'spring', 'spring boot', 'spring framework',
    'asp.net', '.net', 'dotnet', 'rails', 'ruby on rails', 'laravel', 'symfony',
    'gin', 'echo', 'fiber', 'actix', 'rocket',
    'rest api', 'restful', 'graphql', 'grpc', 'websocket', 'websockets', 'socket',
    'mqtt', 'socket.io',
    'microservices', 'serverless', 'api gateway', 'api integration',
    'oauth', 'jwt', 'crud', 'mern', 'mean', 'lamp',
    'strapi', 'directus', 'payload', 'keystone',
  ],
  'Databases': [
    'postgresql', 'postgres', 'mysql', 'mariadb', 'sqlite', 'oracle', 'sql server',
    'mongodb', 'mongoose', 'dynamodb', 'cassandra', 'couchdb', 'firebase', 'supabase',
    'redis', 'memcached', 'elasticsearch', 'opensearch', 'neo4j',
    'influxdb', 'timescaledb', 'neondb', 'planetscale', 'cockroachdb', 'fauna',
    'prisma', 'typeorm', 'sequelize', 'knex', 'drizzle', 'sqlalchemy', 'hibernate',
    'database design', 'data modeling',
  ],
  'Cloud & DevOps': [
    'aws', 'amazon web services', 'azure', 'google cloud', 'gcp',
    'ec2', 's3', 'lambda', 'cloudfront', 'rds', 'sqs', 'sns', 'ecs', 'eks',
    'docker', 'kubernetes', 'k8s', 'helm', 'terraform', 'ansible', 'puppet', 'chef',
    'ci/cd', 'jenkins', 'github actions', 'gitlab ci', 'circleci', 'travis ci',
    'nginx', 'apache', 'caddy', 'vercel', 'netlify', 'heroku', 'railway', 'render',
    'linux', 'ubuntu', 'centos', 'debian', 'windows server',
    'prometheus', 'grafana', 'datadog', 'new relic', 'cloudwatch',
    'elk stack', 'splunk', 'loki',
    'infrastructure as code', 'iac', 'devops', 'sre', 'site reliability',
  ],
  'Mobile': [
    'react native', 'flutter', 'ios', 'android', 'swiftui', 'jetpack compose',
    'xamarin', 'ionic', 'capacitor', 'cordova', 'expo',
    'mobile development', 'app development',
  ],
  'Data & ML': [
    'machine learning', 'deep learning', 'artificial intelligence', 'ai', 'ml',
    'natural language processing', 'nlp', 'computer vision',
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn',
    'pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn', 'jupyter',
    'data analysis', 'data science', 'data engineering', 'data pipeline',
    'etl', 'data warehouse', 'data lake', 'big data',
    'apache spark', 'hadoop', 'kafka', 'airflow', 'dbt',
    'tableau', 'power bi', 'looker', 'metabase',
    'statistics', 'regression', 'classification', 'clustering',
    'llm', 'large language model', 'generative ai', 'prompt engineering',
    'langchain', 'llamaindex', 'ollama', 'rag', 'chainlit',
    'openai', 'hugging face',
  ],
  'Testing': [
    'unit testing', 'integration testing', 'e2e testing', 'end-to-end testing',
    'jest', 'mocha', 'chai', 'vitest', 'cypress', 'playwright', 'selenium',
    'pytest', 'junit', 'testng', 'rspec', 'minitest',
    'tdd', 'test driven development', 'bdd', 'behavior driven development',
    'qa', 'quality assurance', 'test automation',
    'code coverage',
  ],
  'Version Control & Collaboration': [
    'git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial',
    'code review', 'pull request', 'merge request', 'branching strategy',
    'jira', 'confluence', 'trello', 'asana', 'linear', 'notion',
    'agile', 'scrum', 'kanban', 'sprint planning',
    'project management', 'product management',
  ],
  'Architecture & Design': [
    'system design', 'software architecture', 'design patterns',
    'solid principles', 'clean code', 'clean architecture',
    'domain driven design', 'ddd', 'event driven', 'cqrs', 'event sourcing',
    'distributed systems', 'high availability',
    'message queue', 'pub/sub',
  ],
  'Security': [
    'cybersecurity', 'information security', 'application security',
    'owasp', 'penetration testing', 'vulnerability assessment',
    'encryption', 'ssl', 'tls', 'https', 'cors',
    'sso', 'single sign-on', 'saml', 'ldap', 'active directory',
    'security audit', 'compliance', 'gdpr', 'soc2', 'hipaa',
  ],
  'Automation & Scripting': [
    'automation', 'web scraping', 'scripting',
    'apps script', 'google apps script',
    'puppeteer', 'cheerio', 'beautifulsoup', 'scrapy',
    'zapier', 'n8n', 'make',
    'cron', 'task scheduling',
  ],
  'IoT & Embedded': [
    'iot', 'internet of things', 'embedded systems',
    'arduino', 'raspberry pi', 'esp32',
    'modbus', 'opcua', 'industrial communication protocol',
  ],
};

// Flatten all skills into a single array for quick lookups
export const ALL_SKILLS: string[] = Object.values(SKILL_DICTIONARY).flat();

// Multi-word skills that need special matching
export const MULTI_WORD_SKILLS: string[] = ALL_SKILLS.filter((s) => s.includes(' ') || s.includes('/') || s.includes('.'));

// Single-word skills
export const SINGLE_WORD_SKILLS: string[] = ALL_SKILLS.filter((s) => !s.includes(' ') && !s.includes('/') && !s.includes('.'));
