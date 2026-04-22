import { ALL_SKILLS, MULTI_WORD_SKILLS, SINGLE_WORD_SKILLS } from './skill-dictionary';

// Canonical name mapping — deduplicate aliases
const CANONICAL: Record<string, string> = {
  'reactjs': 'react', 'react.js': 'react',
  'vuejs': 'vue', 'vue.js': 'vue',
  'angularjs': 'angular',
  'nextjs': 'next.js',
  'nuxt.js': 'nuxt',
  'nodejs': 'node.js',
  'expressjs': 'express',
  'tailwindcss': 'tailwind',
  'golang': 'go',
  'postgres': 'postgresql',
  'sklearn': 'scikit-learn',
  'websockets': 'websocket',
};

function canonicalize(skill: string): string {
  const lower = skill.toLowerCase().trim();
  return CANONICAL[lower] || lower;
}

// Words that should never be treated as skills
const NOISE_WORDS = new Set([
  'and', 'or', 'the', 'a', 'an', 'in', 'of', 'for', 'to', 'with', 'on', 'at',
  'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'shall', 'can', 'need', 'must', 'that', 'this', 'these', 'those',
  'it', 'its', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'they',
  'etc', 'e.g', 'i.e', 'vs', 'using', 'used', 'use', 'also', 'including',
  'such', 'like', 'well', 'good', 'great', 'strong', 'excellent',
  'proficient', 'proficiency', 'experience', 'experienced', 'knowledge',
  'familiar', 'familiarity', 'understanding', 'skills', 'skill',
  'development', 'developer', 'engineer', 'engineering',
  'senior', 'junior', 'lead', 'staff', 'principal', 'intern',
  'tools', 'technologies', 'frameworks', 'libraries', 'platforms',
  'years', 'year', 'months', 'month', 'work', 'working',
  'database', 'databases', 'frontend', 'backend', 'front-end', 'back-end',
  'design', 'other', 'related', 'relevant', 'required', 'preferred',
  'ability', 'able', 'capable', 'hands-on', 'hands', 'on',
]);

/**
 * Try to find the Skills section in resume text
 */
function findSkillsSection(text: string): string | null {
  const patterns = [
    // "Skills" header followed by content until next section
    /(?:^|\n)\s*(?:skills|technical skills|core skills|key skills|technologies|tech stack|tools & technologies|tools and technologies|expertise|core competencies|technical expertise|technical proficiency)\s*[:\-—]?\s*\n([\s\S]*?)(?:\n\s*(?:experience|education|projects|work|employment|certifications|achievements|summary|objective|profile|interests|hobbies|references|awards|publications|volunteer|activities|languages)\s*[:\-—]?\s*(?:\n|$)|$)/i,
    // Skills inline: "Skills: ..." or "Skills- ..."
    /(?:^|\n)\s*(?:skills|technical skills|core skills)\s*[:\-—]\s*([\s\S]{15,2000}?)(?:\n\s*(?:experience|education|projects|work|employment|certifications|achievements|summary|objective)\s*[:\-—]?\s*(?:\n|$)|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().length > 10) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Parse skills from a skills section by splitting on delimiters.
 * This is the DYNAMIC approach — extracts whatever the user listed,
 * not limited to a dictionary.
 */
function parseSkillsFromSection(sectionText: string): string[] {
  const skills = new Set<string>();

  // Split into lines first
  const lines = sectionText.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Remove category prefixes like "Development-", "Database:", "Frontend:", "Front-end:"
    let cleaned = line.replace(/^[\w\s&/\-]+[:\-—]\s*/i, '');

    // Expand parentheticals: "AWS (ECS, EKS)" → "AWS, ECS, EKS"
    // But remove descriptive parentheticals: "Grafana(for visualization)" → "Grafana"
    cleaned = cleaned.replace(/\((?:for|used for|e\.g\.?|such as|including|like)\s+[^)]*\)/gi, '');
    cleaned = cleaned.replace(/(\w+)\s*\(([^)]+)\)/g, '$1, $2');

    // Split on common delimiters: comma, semicolon, pipe, bullet
    const tokens = cleaned.split(/[,;|•●▪◆►]\s*/);

    for (let token of tokens) {
      // Clean up the token
      token = token
        .replace(/\(.*?\)/g, '')       // remove any remaining parentheticals
        .replace(/^\s*[-–—•●]\s*/, '') // remove leading bullets/dashes
        .trim();

      // Split "SQL & NoSQL", "X and Y"
      const subTokens = token.split(/\s*&\s*|\s+and\s+/i);

      for (let sub of subTokens) {
        sub = sub.trim()
          .replace(/^\d+\.\s*/, '')    // remove numbering like "1. "
          .replace(/\s+/g, ' ')        // collapse whitespace
          .trim();

        if (!sub || sub.length < 2 || sub.length > 50) continue;

        // Skip if it's all noise words
        const words = sub.toLowerCase().split(/\s+/);
        if (words.every((w) => NOISE_WORDS.has(w))) continue;

        // Skip pure numbers
        if (/^\d+$/.test(sub)) continue;

        skills.add(canonicalize(sub));
      }
    }
  }

  return Array.from(skills).sort();
}

/**
 * Match skills against text using the dictionary.
 * Used for full-text scanning (ATS) and JD keyword extraction.
 */
function matchSkillsFromDictionary(text: string): Set<string> {
  const normalized = text.toLowerCase().replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ');
  const found = new Set<string>();

  for (const skill of MULTI_WORD_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s,;|/()\\[\\]])${escaped}(?:$|[\\s,;|/()\\[\\]])`, 'i');
    if (regex.test(normalized)) {
      found.add(canonicalize(skill));
    }
  }

  for (const skill of SINGLE_WORD_SKILLS) {
    if (skill.length < 2) continue;
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(normalized)) {
      found.add(canonicalize(skill));
    }
  }

  return found;
}

/**
 * Extract skills from the Skills section of a resume — DYNAMIC parsing.
 * Reads whatever the user listed, not limited to a dictionary.
 * Used for building skill profile for job matching.
 */
export function extractSkillsFromSection(text: string): string[] {
  const section = findSkillsSection(text);
  if (section) {
    return parseSkillsFromSection(section);
  }
  // Fallback: no skills section found, use dictionary matching on full text
  return Array.from(matchSkillsFromDictionary(text)).sort();
}

/**
 * Extract skills from full resume text using dictionary matching.
 * Used for ATS scoring where the whole document matters.
 */
export function extractSkillsFullText(text: string): string[] {
  return Array.from(matchSkillsFromDictionary(text)).sort();
}

/**
 * Extract keywords from a job description using dictionary matching.
 */
export function extractKeywordsFromJD(jobDescription: string): string[] {
  const found = matchSkillsFromDictionary(jobDescription);

  const normalized = jobDescription.toLowerCase();
  const expPatterns = [
    /experience (?:with|in|using) ([a-z][a-z0-9.#+\- ]{2,30}?)(?:[,;.]|\s(?:and|or|is))/gi,
    /proficien(?:t|cy) (?:with|in) ([a-z][a-z0-9.#+\- ]{2,30}?)(?:[,;.]|\s(?:and|or|is))/gi,
    /knowledge of ([a-z][a-z0-9.#+\- ]{2,30}?)(?:[,;.]|\s(?:and|or|is))/gi,
    /familiar(?:ity)? with ([a-z][a-z0-9.#+\- ]{2,30}?)(?:[,;.]|\s(?:and|or|is))/gi,
  ];

  for (const pattern of expPatterns) {
    let match;
    while ((match = pattern.exec(normalized)) !== null) {
      const extracted = match[1].trim();
      if (ALL_SKILLS.includes(extracted)) {
        found.add(canonicalize(extracted));
      }
    }
  }

  return Array.from(found).sort();
}

/**
 * Calculate ATS compatibility score
 */
export function calculateAtsScore(
  resumeSkills: string[],
  jdKeywords: string[]
): {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
} {
  if (jdKeywords.length === 0) {
    return { score: 0, matchedKeywords: [], missingKeywords: [], suggestions: ['The job description does not contain recognizable skills or keywords.'] };
  }

  const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase()));
  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of jdKeywords) {
    if (resumeSet.has(keyword.toLowerCase())) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const score = Math.round((matched.length / jdKeywords.length) * 100);
  const suggestions: string[] = [];

  if (score < 40) {
    suggestions.push('Your resume has low keyword match. Consider tailoring it specifically for this role.');
  } else if (score < 70) {
    suggestions.push('Good foundation, but adding more relevant keywords could significantly improve your chances.');
  } else {
    suggestions.push('Strong keyword match! Focus on fine-tuning the presentation.');
  }

  if (missing.length > 0) {
    const topMissing = missing.slice(0, 8);
    suggestions.push(`Add these keywords to your resume if you have the skills: ${topMissing.join(', ')}`);
  }

  if (missing.length > 8) {
    suggestions.push(`${missing.length - 8} more keywords from the job description are not in your resume.`);
  }

  const missingSet = new Set(missing);
  if (['python', 'javascript', 'typescript', 'java', 'go', 'rust', 'c++'].some((l) => missingSet.has(l))) {
    suggestions.push('The job requires programming languages not found in your resume. Make sure to list all languages you know.');
  }
  if (['aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes'].some((c) => missingSet.has(c))) {
    suggestions.push('Cloud/DevOps skills are mentioned in the JD. Add any cloud certifications or experience you have.');
  }
  if (['agile', 'scrum', 'kanban', 'jira'].some((a) => missingSet.has(a))) {
    suggestions.push('Agile methodology is required. Mention your experience with Agile/Scrum if applicable.');
  }

  return { score, matchedKeywords: matched, missingKeywords: missing, suggestions };
}

/**
 * Calculate match: check how many of the user's skills appear in a job description.
 */
export function calculateJobMatch(userSkills: string[], jobDescription: string): {
  matchPercentage: number;
  matchedSkills: string[];
} {
  if (userSkills.length === 0) return { matchPercentage: 0, matchedSkills: [] };

  const descLower = jobDescription.toLowerCase();
  const matchedSkills: string[] = [];

  for (const skill of userSkills) {
    const skillLower = skill.toLowerCase();
    const escaped = skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (skillLower.includes(' ') || skillLower.includes('.') || skillLower.includes('/')) {
      if (descLower.includes(skillLower)) {
        matchedSkills.push(skill);
      }
    } else {
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(descLower)) {
        matchedSkills.push(skill);
      }
    }
  }

  const matchPercentage = Math.round((matchedSkills.length / userSkills.length) * 100);
  return { matchPercentage, matchedSkills };
}
