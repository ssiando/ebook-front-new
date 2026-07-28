import { clsx } from '@/utils/clsx'

interface BadgeProps {
  tone?: 'green' | 'gray'
  children: React.ReactNode
}

const TONE_CLASSES: Record<NonNullable<BadgeProps['tone']>, string> = {
  green: 'bg-emerald-50 text-emerald-700',
  gray: 'bg-gray-100 text-gray-500',
}

export function Badge({ tone = 'gray', children }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex rounded px-2 py-0.5 text-xs font-medium',
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </span>
  )
}
