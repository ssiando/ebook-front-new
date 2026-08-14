export const BOOK_CATEGORIES = ['소설', '자기계발', '경제경영', '인문', '에세이', '시', '과학'] as const
export type BookCategory = (typeof BOOK_CATEGORIES)[number]

export const BOOK_STATUSES = ['ON_SALE', 'OUT_OF_STOCK', 'DISCONTINUED'] as const
export type BookStatus = (typeof BOOK_STATUSES)[number]

export interface Book {
  id: string
  title: string
  author: string
  publisher: string
  category: BookCategory
  price: number
  discountRate: number
  rating: number
  reviewCount: number
  stock: number
  status: BookStatus
  publishedAt: string
  updatedAt: string
}

export interface BookSearchParams {
  keyword: string
  category: BookCategory | 'ALL'
  status: BookStatus | 'ALL'
}
