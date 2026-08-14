import { useConfirmStore } from '@/store/useConfirmStore'
import { Button } from './Button'

/** AppProviders에 마운트되는 공통 확인 모달. store/useConfirmStore의 confirm()으로 띄웁니다. */
export function ConfirmDialogHost() {
  const request = useConfirmStore((s) => s.request)

  if (!request) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30">
      <div className="w-[420px] rounded-lg bg-white shadow-xl">
        <div className="px-6 py-8 text-center text-sm whitespace-pre-line text-gray-600">
          {request.message}
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <Button type="button" variant="secondary" onClick={() => request.resolve(false)}>
            취소
          </Button>
          <Button type="button" variant="primary" onClick={() => request.resolve(true)}>
            확인
          </Button>
        </div>
      </div>
    </div>
  )
}
