export const BOOK_TYPES = ['EBOOK', 'PAPER', 'BOTH'] as const
export type BookType = (typeof BOOK_TYPES)[number]

export interface Book {
  id: string
  title: string
  subtitle: string | null
  bookType: BookType
  pageCount: number | null
  copyrightOwner: string | null
  firstPublishDt: string | null
  publisher: string | null
  isbn: string | null
  freeYn: boolean
  coverImageUrl: string | null
  thumbnailUrl: string | null
  activeYn: boolean
  createdAt: string
  updatedAt: string
}

export interface BookSearchParams {
  keyword: string
  bookType: BookType | 'ALL'
  activeYn: 'ALL' | 'true' | 'false'
}

export interface CreateBookPayload {
  title: string
  subtitle?: string
  bookType: BookType
  pageCount?: number
  copyrightOwner?: string
  firstPublishDt?: string
  publisher?: string
  isbn?: string
  freeYn: boolean
  coverImageUrl?: string
  thumbnailUrl?: string
}

export interface UpdateBookPayload extends CreateBookPayload {
  id: string
  activeYn: boolean
}
