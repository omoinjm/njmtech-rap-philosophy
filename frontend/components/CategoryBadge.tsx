import type { PhilosophicalCategory } from '@/lib/types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function CategoryBadge({ category }: { category: PhilosophicalCategory }) {
  const color = CATEGORY_COLORS[category]
  return (
    <Badge
      variant="outline"
      className={cn('rounded-none text-[10px] uppercase tracking-widest')}
      style={{ borderColor: color, color }}
    >
      {CATEGORY_LABELS[category]}
    </Badge>
  )
}
