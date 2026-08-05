import type { ButtonHTMLAttributes } from 'react'
import { Plus } from 'lucide-react'
import { Button } from './Button'

export function AddButton({
  children = '등록',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button type="button" variant="primary" {...props}>
      <Plus size={14} />
      {children}
    </Button>
  )
}
