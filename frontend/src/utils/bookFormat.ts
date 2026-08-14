import type { BadgeTone } from '@/components/common/ui/Badge'
import type { Book, BookStatus } from '@/types/book'

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  ON_SALE: '판매중',
  OUT_OF_STOCK: '품절',
  DISCONTINUED: '절판',
}

export const BOOK_STATUS_TONES: Record<BookStatus, BadgeTone> = {
  ON_SALE: 'green',
  OUT_OF_STOCK: 'gray',
  DISCONTINUED: 'red',
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString()}원`
}

export function discountedPrice(book: Book): number {
  return Math.round(book.price * (1 - book.discountRate / 100))
}

/** 표시용 적립 포인트(할인가의 5%) — 실제 적립률은 백엔드 연동 시 정책값으로 대체하세요. */
export function estimatedPoints(price: number): number {
  return Math.round((price * 0.05) / 10) * 10
}

/** 출간일이 90일 이내면 NEW로 표시합니다. */
export function isNewBook(publishedAt: string): boolean {
  const days = (Date.now() - new Date(publishedAt).getTime()) / 86_400_000
  return days >= 0 && days <= 90
}
