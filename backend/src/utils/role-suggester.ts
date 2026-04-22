/**
 * Role suggestion engine.
 * Maps skill combinations to likely job titles using weighted scoring.
 * Each role has "required" skills (must have at least some) and "bonus" skills.
 */

interface RoleTemplate {
  title: string;
  required: string[];   // must match at least 2 of these
  bonus: string[];       // extra score for each match
  minRequired: number;   // minimum required skills to qualify
}

const ROLE_TEMPLATES: RoleTemplate[] = [
  // Full Stack
  {
    title: 'Full Stack Developer',
    required: ['react', 'node.js', 'express', 'mongodb', 'postgresql', 'next.js', 'typescript', 'javascript'],
    bonus: ['graphql', 'docker', 'redis', 'prisma', 'tailwind', 'rest api', 'restful'],
    minRequired: 3,
  },
  {
    title: 'MERN Stack Developer',
    required: ['mongodb', 'express', 'react', 'node.js'],
    bonus: ['javascript', 'typescript', 'redux', 'next.js', 'mern', 'restful'],
    minRequired: 3,
  },
  {
    title: 'MEAN Stack Developer',
    required: ['mongodb', 'express', 'angular', 'node.js'],
    bonus: ['typescript', 'rxjs', 'ngrx', 'mean'],
    minRequired: 3,
  },

  // Frontend
  {
    title: 'Frontend Developer',
    required: ['react', 'javascript', 'typescript', 'html', 'css', 'next.js', 'vue', 'angular', 'svelte'],
    bonus: ['tailwind', 'redux', 'webpack', 'vite', 'sass', 'material ui', 'responsive design', 'ssr'],
    minRequired: 3,
  },
  {
    title: 'React Developer',
    required: ['react', 'javascript', 'typescript'],
    bonus: ['next.js', 'redux', 'zustand', 'tailwind', 'material ui', 'ssr', 'graphql', 'vite'],
    minRequired: 2,
  },
  {
    title: 'Next.js Developer',
    required: ['next.js', 'react', 'typescript'],
    bonus: ['ssr', 'tailwind', 'prisma', 'vercel', 'node.js', 'graphql'],
    minRequired: 2,
  },
  {
    title: 'Angular Developer',
    required: ['angular', 'typescript'],
    bonus: ['rxjs', 'ngrx', 'material ui', 'html', 'css', 'sass'],
    minRequired: 2,
  },
  {
    title: 'Vue.js Developer',
    required: ['vue', 'javascript', 'typescript'],
    bonus: ['nuxt', 'vuex', 'pinia', 'tailwind', 'vite'],
    minRequired: 2,
  },

  // Backend
  {
    title: 'Backend Developer',
    required: ['node.js', 'express', 'python', 'django', 'java', 'spring', 'postgresql', 'mongodb', 'go'],
    bonus: ['rest api', 'restful', 'graphql', 'docker', 'redis', 'microservices', 'sql', 'jwt', 'prisma'],
    minRequired: 3,
  },
  {
    title: 'Node.js Developer',
    required: ['node.js', 'express', 'javascript', 'typescript'],
    bonus: ['mongodb', 'postgresql', 'redis', 'graphql', 'restful', 'docker', 'prisma', 'nestjs'],
    minRequired: 2,
  },
  {
    title: 'Python Developer',
    required: ['python', 'django', 'flask', 'fastapi'],
    bonus: ['postgresql', 'redis', 'docker', 'celery', 'sqlalchemy', 'rest api', 'aws'],
    minRequired: 2,
  },
  {
    title: 'Django Developer',
    required: ['django', 'python'],
    bonus: ['postgresql', 'rest api', 'restful', 'docker', 'celery', 'redis', 'html', 'css'],
    minRequired: 2,
  },
  {
    title: 'Java Developer',
    required: ['java', 'spring', 'spring boot'],
    bonus: ['hibernate', 'microservices', 'docker', 'kubernetes', 'postgresql', 'mysql', 'maven'],
    minRequired: 1,
  },
  {
    title: 'Go Developer',
    required: ['go', 'golang'],
    bonus: ['docker', 'kubernetes', 'grpc', 'postgresql', 'redis', 'microservices'],
    minRequired: 1,
  },

  // DevOps / Cloud
  {
    title: 'DevOps Engineer',
    required: ['docker', 'kubernetes', 'ci/cd', 'aws', 'terraform', 'ansible', 'jenkins', 'linux'],
    bonus: ['prometheus', 'grafana', 'helm', 'github actions', 'gitlab ci', 'nginx', 'devops'],
    minRequired: 3,
  },
  {
    title: 'Cloud Engineer',
    required: ['aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform'],
    bonus: ['lambda', 'ec2', 's3', 'cloudformation', 'ci/cd', 'linux', 'serverless'],
    minRequired: 2,
  },
  {
    title: 'SRE / Site Reliability Engineer',
    required: ['docker', 'kubernetes', 'prometheus', 'grafana', 'linux', 'ci/cd'],
    bonus: ['terraform', 'aws', 'python', 'bash', 'elk stack', 'sre', 'datadog'],
    minRequired: 3,
  },

  // Data
  {
    title: 'Data Engineer',
    required: ['python', 'sql', 'apache spark', 'kafka', 'airflow', 'hadoop'],
    bonus: ['aws', 'docker', 'postgresql', 'mongodb', 'etl', 'data pipeline', 'big data', 'dbt'],
    minRequired: 3,
  },
  {
    title: 'Data Scientist',
    required: ['python', 'machine learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn'],
    bonus: ['deep learning', 'nlp', 'computer vision', 'statistics', 'jupyter', 'sql', 'r'],
    minRequired: 3,
  },
  {
    title: 'ML Engineer',
    required: ['python', 'tensorflow', 'pytorch', 'machine learning', 'deep learning'],
    bonus: ['docker', 'kubernetes', 'mlflow', 'aws', 'data pipeline', 'pandas', 'numpy'],
    minRequired: 2,
  },
  {
    title: 'AI/ML Developer',
    required: ['python', 'langchain', 'llm', 'openai', 'rag', 'machine learning', 'tensorflow', 'pytorch'],
    bonus: ['ollama', 'chainlit', 'hugging face', 'nlp', 'prompt engineering', 'generative ai'],
    minRequired: 2,
  },

  // Mobile
  {
    title: 'React Native Developer',
    required: ['react native', 'react', 'javascript', 'typescript'],
    bonus: ['expo', 'redux', 'ios', 'android', 'firebase'],
    minRequired: 2,
  },
  {
    title: 'Flutter Developer',
    required: ['flutter', 'dart'],
    bonus: ['firebase', 'ios', 'android', 'rest api'],
    minRequired: 1,
  },
  {
    title: 'Mobile App Developer',
    required: ['react native', 'flutter', 'ios', 'android', 'swift', 'kotlin'],
    bonus: ['firebase', 'expo', 'typescript', 'dart'],
    minRequired: 2,
  },

  // Testing / QA
  {
    title: 'QA Automation Engineer',
    required: ['selenium', 'playwright', 'cypress', 'jest', 'pytest'],
    bonus: ['typescript', 'javascript', 'python', 'ci/cd', 'test automation', 'e2e testing'],
    minRequired: 2,
  },
  {
    title: 'SDET / Test Engineer',
    required: ['selenium', 'playwright', 'cypress', 'java', 'python', 'typescript'],
    bonus: ['ci/cd', 'docker', 'jest', 'junit', 'tdd', 'automation'],
    minRequired: 2,
  },

  // Specialized
  {
    title: 'IoT Developer',
    required: ['iot', 'mqtt', 'embedded systems', 'arduino', 'raspberry pi', 'python'],
    bonus: ['node.js', 'influxdb', 'grafana', 'docker', 'websocket', 'industrial communication protocol'],
    minRequired: 2,
  },
  {
    title: 'Blockchain Developer',
    required: ['solidity', 'ethereum', 'web3', 'smart contracts'],
    bonus: ['javascript', 'typescript', 'react', 'node.js', 'rust'],
    minRequired: 2,
  },

  // General Software
  {
    title: 'Software Engineer',
    required: ['javascript', 'typescript', 'python', 'java', 'go', 'c++', 'c#', 'rust'],
    bonus: ['docker', 'git', 'sql', 'rest api', 'restful', 'agile', 'ci/cd', 'system design'],
    minRequired: 2,
  },
  {
    title: 'Web Developer',
    required: ['html', 'css', 'javascript', 'react', 'php', 'wordpress', 'laravel'],
    bonus: ['bootstrap', 'jquery', 'sass', 'typescript', 'mysql', 'firebase'],
    minRequired: 3,
  },
];

/**
 * Suggest up to 10 candidate job roles based on extracted skills.
 * Returns more candidates so the caller can rank them by real job counts.
 */
export function suggestRoles(skills: string[]): string[] {
  if (skills.length === 0) return [];

  const skillSet = new Set(skills.map((s) => s.toLowerCase()));

  const scored: { title: string; score: number }[] = [];

  for (const role of ROLE_TEMPLATES) {
    const requiredMatches = role.required.filter((s) => skillSet.has(s)).length;
    if (requiredMatches < role.minRequired) continue;

    const bonusMatches = role.bonus.filter((s) => skillSet.has(s)).length;

    const requiredScore = (requiredMatches / role.required.length) * 3;
    const bonusScore = role.bonus.length > 0 ? (bonusMatches / role.bonus.length) : 0;
    const score = requiredScore + bonusScore;

    scored.push({ title: role.title, score });
  }

  scored.sort((a, b) => b.score - a.score);

  // Take top 10, light dedup (only remove exact duplicates)
  const result: string[] = [];
  const seen = new Set<string>();

  for (const { title } of scored) {
    if (result.length >= 10) break;
    if (seen.has(title)) continue;
    result.push(title);
    seen.add(title);
  }

  if (result.length < 3 && !result.includes('Software Engineer')) {
    result.push('Software Engineer');
  }

  return result;
}
