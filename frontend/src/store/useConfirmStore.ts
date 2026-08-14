import { create } from 'zustand'

// 실제 사내 프로젝트에서는 @vanta/common 의 confirm 유틸을 사용합니다.
// 이 저장소에는 해당 패키지가 없어 window.confirm을 대체할 최소 구현을 로컬로 둡니다.

interface ConfirmRequest {
  message: string
  resolve: (result: boolean) => void
}

interface ConfirmState {
  request: ConfirmRequest | null
}

export const useConfirmStore = create<ConfirmState>(() => ({
  request: null,
}))

/** window.confirm(message) 대신 사용합니다. 공통 확인 모달을 띄우고 확인/취소 결과를 Promise<boolean>로 돌려줍니다. */
export function confirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.setState({
      request: {
        message,
        resolve: (result) => {
          useConfirmStore.setState({ request: null })
          resolve(result)
        },
      },
    })
  })
}
