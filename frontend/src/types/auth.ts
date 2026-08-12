export interface LoginPayload {
  email: string
  password: string
}

// 백엔드 LoginResponse(com.mict.ebook.auth.dto.LoginResponse)와 동일한 형태.
export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  adminPk: number
  adminName: string
  email: string
  roles: string[]
}

// 로그인한 관리자의 클라이언트 상태. Admin Management 화면에서 다루는 Admin(목데이터)과는
// 별개로, 로그인·권한 판단에 필요한 최소 정보만 담는다.
export interface CurrentAdmin {
  id: number
  adminName: string
  email: string
  roles: string[]
}
