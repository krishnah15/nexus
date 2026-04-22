import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  colorMap: ReadonlyArray<{ value: string; label: string; color: string }>;
  className?: string;
}

export function StatusBadge({ status, colorMap, className }: StatusBadgeProps) {
  const config = colorMap.find((s) => s.value === status);
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white',
        config?.color || 'bg-gray-500',
        className
      )}
    >
      {config?.label || status}
    </span>
  );
}
