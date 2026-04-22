export interface LearningItem {
  id: string;
  category: string;
  title: string;
  platform?: string;
  url?: string;
  progress: number;
  status: string;
  priority: string;
  targetDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
