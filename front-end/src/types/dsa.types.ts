export interface DsaProblem {
  id: string;
  title: string;
  platform?: string;
  url?: string;
  difficulty?: string;
  topic?: string;
  status: string;
  timeTakenMin?: number;
  notes?: string;
  solvedAt?: string;
  createdAt: string;
}

export interface DsaStats {
  byDifficulty: Array<{ difficulty: string; _count: number }>;
  byTopic: Array<{ topic: string; _count: number }>;
  byStatus: Array<{ status: string; _count: number }>;
  heatmap: Record<string, number>;
}
