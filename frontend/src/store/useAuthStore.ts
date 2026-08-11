import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CurrentAdmin } from '@/types/auth'

// 실제 사내 프로젝트에서는 로그인 정보 같은 전사 공통 상태는 @vanta/common 의 스토어를 사용합니다.
// 이 저장소에는 해당 패키지가 없어 동일한 역할의 스토어를 로컬에 둡니다.
interface AuthState {
  currentAdmin: CurrentAdmin | null
  login: (admin: CurrentAdmin) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentAdmin: null,
      login: (admin) => set({ currentAdmin: admin }),
      logout: () => {
        localStorage.removeItem('accessToken')
        set({ currentAdmin: null })
      },
    }),
    { name: 'ebook-auth' },
  ),
)
