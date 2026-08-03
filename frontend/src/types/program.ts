export interface ProgramItem {
  id: string
  label: string
  code: string
  type: 'API' | 'PAGE'
  parentId: string | null
}
