import type { BadgeTone } from '@/components/common/ui/Badge'

const TONES: readonly BadgeTone[] = ['green', 'gray', 'blue', 'red']

/** 공통코드 metadata처럼 외부에서 문자열로 들어오는 색상 힌트를 안전한 BadgeTone으로 변환합니다. */
export function toBadgeTone(value: string | undefined, fallback: BadgeTone = 'gray'): BadgeTone {
  return (TONES as readonly string[]).includes(value ?? '') ? (value as BadgeTone) : fallback
}
