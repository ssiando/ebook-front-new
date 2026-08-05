import type { ButtonHTMLAttributes } from 'react'
import { Search } from 'lucide-react'
import { Button } from './Button'

export function SearchButton({
  children = '조회',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button type="button" variant="primary" {...props}>
      <Search size={14} />
      {children}
    </Button>
  )
}
