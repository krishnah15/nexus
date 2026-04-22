export const JOB_STATUSES = [
  { value: 'saved', label: 'Saved', color: 'bg-gray-500' },
  { value: 'applied', label: 'Applied', color: 'bg-blue-500' },
  { value: 'screening', label: 'Screening', color: 'bg-cyan-500' },
  { value: 'interview', label: 'Interview', color: 'bg-purple-500' },
  { value: 'technical', label: 'Technical', color: 'bg-indigo-500' },
  { value: 'offer', label: 'Offer', color: 'bg-green-500' },
  { value: 'accepted', label: 'Accepted', color: 'bg-emerald-500' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-yellow-500' },
] as const;

export const LEARNING_CATEGORIES = [
  { value: 'course', label: 'Course' },
  { value: 'skill', label: 'Skill' },
  { value: 'certification', label: 'Certification' },
  { value: 'book', label: 'Book' },
  { value: 'project', label: 'Project' },
] as const;

export const LEARNING_STATUSES = [
  { value: 'not_started', label: 'Not Started', color: 'bg-gray-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'paused', label: 'Paused', color: 'bg-yellow-500' },
] as const;

export const DSA_DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'text-green-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'hard', label: 'Hard', color: 'text-red-400' },
] as const;

export const DSA_STATUSES = [
  { value: 'todo', label: 'Todo', color: 'bg-gray-500' },
  { value: 'attempted', label: 'Attempted', color: 'bg-yellow-500' },
  { value: 'solved', label: 'Solved', color: 'bg-green-500' },
  { value: 'review', label: 'Review', color: 'bg-purple-500' },
] as const;

export const COUNTRY_STATUSES = [
  { value: 'researching', label: 'Researching', color: 'bg-blue-500' },
  { value: 'preparing', label: 'Preparing', color: 'bg-yellow-500' },
  { value: 'applied', label: 'Applied', color: 'bg-purple-500' },
  { value: 'approved', label: 'Approved', color: 'bg-green-500' },
  { value: 'moved', label: 'Moved', color: 'bg-emerald-500' },
] as const;

export const PATHWAY_TYPES = [
  'PR (Permanent Residency)',
  'Work Visa',
  'Student Visa',
  'Startup Visa',
  'Investment Visa',
  'Family Sponsorship',
  'Skilled Worker',
  'Other',
] as const;
