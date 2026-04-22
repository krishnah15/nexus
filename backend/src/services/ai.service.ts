import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const key = (env as any).ANTHROPIC_API_KEY;
    if (!key) throw Object.assign(new Error('ANTHROPIC_API_KEY not configured'), { statusCode: 400 });
    client = new Anthropic({ apiKey: key });
  }
  return client;
}

export function isAiConfigured(): boolean {
  return !!(env as any).ANTHROPIC_API_KEY;
}

/**
 * Generate a tailored cover letter based on resume text + job description
 */
export async function generateCoverLetter(params: {
  resumeText: string;
  jobDescription: string;
  jobTitle: string;
  company: string;
  userName: string;
}): Promise<string> {
  const ai = getClient();

  const message = await ai.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `Write a professional cover letter for this job application.

**Applicant:** ${params.userName}
**Target Role:** ${params.jobTitle} at ${params.company}

**Applicant's Resume:**
${params.resumeText.substring(0, 3000)}

**Job Description:**
${params.jobDescription.substring(0, 3000)}

Instructions:
- Keep it concise (3-4 paragraphs, under 300 words)
- Highlight specific skills from the resume that match the job requirements
- Show enthusiasm without being generic
- Use a professional but natural tone
- Do NOT use placeholder brackets like [Your Name] — use the actual name provided
- Start with "Dear Hiring Manager," and end with a sign-off using the applicant's name
- Do NOT include addresses, dates, or headers — just the letter body`
    }],
  });

  const block = message.content[0];
  return block.type === 'text' ? block.text : '';
}

/**
 * Generate resume tailoring suggestions for a specific job
 */
export async function generateResumeSuggestions(params: {
  resumeText: string;
  jobDescription: string;
  matchedSkills: string[];
  missingSkills: string[];
}): Promise<{
  keywordsToAdd: string[];
  bulletSuggestions: string[];
  summary: string;
}> {
  const ai = getClient();

  const message = await ai.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    messages: [{
      role: 'user',
      content: `Analyze this resume against the job description and provide tailoring suggestions.

**Resume:**
${params.resumeText.substring(0, 3000)}

**Job Description:**
${params.jobDescription.substring(0, 3000)}

**Skills already matching:** ${params.matchedSkills.join(', ') || 'None identified'}
**Skills missing from resume:** ${params.missingSkills.join(', ') || 'None identified'}

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "keywordsToAdd": ["keyword1", "keyword2"],
  "bulletSuggestions": [
    "Rewrite: 'old bullet' → 'improved bullet with keywords'",
    "Add new bullet: 'suggested experience bullet'"
  ],
  "summary": "2-3 sentence overall assessment"
}`
    }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';

  try {
    // Extract JSON from response (handle if wrapped in code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { keywordsToAdd: [], bulletSuggestions: [], summary: 'Could not parse AI response.' };
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      keywordsToAdd: parsed.keywordsToAdd || [],
      bulletSuggestions: parsed.bulletSuggestions || [],
      summary: parsed.summary || '',
    };
  } catch {
    return { keywordsToAdd: params.missingSkills.slice(0, 8), bulletSuggestions: [], summary: text.substring(0, 300) };
  }
}

/**
 * Generate answers for common screening questions
 */
export async function generateScreeningAnswers(params: {
  resumeText: string;
  jobTitle: string;
  company: string;
}): Promise<{ question: string; answer: string }[]> {
  const ai = getClient();

  const message = await ai.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Based on this resume and the role of ${params.jobTitle} at ${params.company}, generate answers to common screening questions.

**Resume:**
${params.resumeText.substring(0, 2500)}

Generate answers for these 5 common screening questions. Keep answers concise (2-3 sentences each).
Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
[
  {"question": "Why are you interested in this role?", "answer": "..."},
  {"question": "What relevant experience do you have?", "answer": "..."},
  {"question": "What is your expected salary?", "answer": "..."},
  {"question": "When can you start?", "answer": "..."},
  {"question": "Why should we hire you?", "answer": "..."}
]`
    }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]';

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}
