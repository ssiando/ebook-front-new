import { create } from 'zustand'

// 실제 사내 프로젝트에서는 사이드바/탭 같은 전사 공통 UI 상태는 @vanta/common 의 스토어를 사용합니다.
// 이 저장소에는 해당 패키지가 없어 동작 확인용으로 동일한 역할의 스토어를 로컬에 둡니다.

export interface OpenTab {
  path: string
  label: string
}

interface UiState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  openTabs: OpenTab[]
  activePath: string
  openTab: (tab: OpenTab) => void
  closeTab: (path: string) => void
  closeAllTabs: () => void
}

const HOME_TAB: OpenTab = { path: '/', label: '홈' }

export const useUiStore = create<UiState>((set, get) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  openTabs: [HOME_TAB],
  activePath: '/',
  openTab: (tab) => {
    const exists = get().openTabs.some((t) => t.path === tab.path)
    set((state) => ({
      openTabs: exists ? state.openTabs : [...state.openTabs, tab],
      activePath: tab.path,
    }))
  },
  closeTab: (path) => {
    if (path === '/') return
    const remaining = get().openTabs.filter((t) => t.path !== path)
    const wasActive = get().activePath === path
    set({
      openTabs: remaining,
      activePath: wasActive ? remaining[remaining.length - 1].path : get().activePath,
    })
  },
  closeAllTabs: () => set({ openTabs: [HOME_TAB], activePath: '/' }),
}))
