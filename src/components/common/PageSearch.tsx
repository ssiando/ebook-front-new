import type { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { RotateCcw } from 'lucide-react'

// 실제 사내 프로젝트에서는 @vanta/common 의 PageSearch를 사용합니다.
// 이 저장소에는 해당 패키지가 없어 동일한 역할을 하는 로컬 구현을 둡니다.
interface PageSearchProps {
  children: ReactNode
  onReset?: () => void
}

export function PageSearch({ children, onReset }: PageSearchProps) {
  const { reset } = useFormContext()

  const handleReset = () => {
    reset()
    onReset?.()
  }

  return (
    <div className="flex flex-wrap items-end gap-4 rounded border border-gray-200 bg-white p-4">
      {children}
      <button
        type="button"
        onClick={handleReset}
        aria-label="초기화"
        className="mb-0.5 flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-50"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  )
}
