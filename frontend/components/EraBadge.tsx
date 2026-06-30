import type { Era } from '@/lib/types'
import { ERA_LABELS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function EraBadge({ era }: { era: Era }) {
  return (
    <Badge
      variant="outline"
      className={cn('rounded-none border-chamber-border bg-chamber-surface text-[10px] uppercase tracking-widest text-gray-300')}
    >
      {ERA_LABELS[era]}
    </Badge>
  )
}
