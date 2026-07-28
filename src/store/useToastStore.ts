import { create } from 'zustand'

// 실제 사내 프로젝트에서는 @vanta/common 의 토스트/알림 유틸을 사용합니다.
// 이 저장소에는 해당 패키지가 없어 showFormErrors 등에서 쓸 최소 구현을 로컬로 둡니다.

export interface ToastMessage {
  id: string
  text: string
}

interface ToastState {
  toasts: ToastMessage[]
  push: (text: string) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (text) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    set((state) => ({ toasts: [...state.toasts, { id, text }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
    }, 4000)
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))
