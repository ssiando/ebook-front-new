import type { ButtonHTMLAttributes } from 'react'
import { Save } from 'lucide-react'
import { Button } from './Button'

export function SaveButton({
  children = '저장',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button type="button" variant="primary" {...props}>
      <Save size={14} />
      {children}
    </Button>
  )
}
