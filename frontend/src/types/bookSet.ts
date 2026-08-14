export interface BookSet {
  id: string
  setName: string
  description: string | null
  activeYn: boolean
  bookCount: number
  bookIds: string[]
  createdAt: string
  updatedAt: string
}

export interface BookSetSearchParams {
  keyword: string
}

export interface CreateBookSetPayload {
  setName: string
  description?: string
}

export interface UpdateBookSetPayload {
  id: string
  setName: string
  description?: string
  activeYn: boolean
}
