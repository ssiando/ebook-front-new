import type { Dayjs } from 'dayjs'

export function toDateInputValue(date: Dayjs): string {
  return date.format('YYYY-MM-DD')
}
