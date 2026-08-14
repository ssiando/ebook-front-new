export const PUBLISH_STATUSES = ['DRAFT', 'REVIEWING', 'PUBLISHED', 'REJECTED'] as const
export type PublishStatus = (typeof PUBLISH_STATUSES)[number]

export const ENCRYPT_STATUSES = [0, 1, 2] as const
export type EncryptStatus = (typeof ENCRYPT_STATUSES)[number]

export interface BookRevision {
  id: string
  bookId: string
  revisionNo: number
  publishedYn: boolean
  publishStatusCd: PublishStatus
  fileName: string
  filePath: string
  encryptStatusCd: EncryptStatus
  createdAt: string
  updatedAt: string
}

export interface CreateBookRevisionPayload {
  revisionNo: number
  publishedYn: boolean
  publishStatusCd: PublishStatus
  fileName: string
  filePath: string
  encryptStatusCd: EncryptStatus
}

export interface UpdateBookRevisionPayload {
  id: string
  bookId: string
  publishedYn: boolean
  publishStatusCd: PublishStatus
  fileName: string
  filePath: string
  encryptStatusCd: EncryptStatus
}
