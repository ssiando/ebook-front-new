import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 백엔드는 모든 응답을 ApiResponse<T> = { success, data, errorCode, message } 로 감싸서 내려준다.
// 각 api 파일은 실제 데이터 타입(T)만 다루면 되도록 여기서 한 번에 풀어준다.
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && 'success' in body) {
      response.data = body.data
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // TODO: 인증 만료 처리 (로그인 페이지 리다이렉트 등)
    }
    // 백엔드는 에러도 ApiResponse.message에 사용자에게 보여줄 문구를 담아 내려준다.
    const message = error.response?.data?.message
    if (message) error.message = message
    return Promise.reject(error)
  },
)
