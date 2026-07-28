import { useToastStore } from '@/store/useToastStore'

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts)
  const remove = useToastStore((s) => s.remove)

  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm whitespace-pre-line text-gray-700 shadow-lg"
        >
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => remove(toast.id)}
            className="text-gray-400 hover:text-gray-600"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
