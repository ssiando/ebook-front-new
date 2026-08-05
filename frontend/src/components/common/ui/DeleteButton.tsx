import type { ButtonHTMLAttributes } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from './Button'

export function DeleteButton({
  children = '삭제',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button type="button" variant="danger" {...props}>
      <Trash2 size={14} />
      {children}
    </Button>
  )
}
