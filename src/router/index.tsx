import { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { GuestGuard } from '@/components/auth/GuestGuard'

// 파일 기반 라우팅: src/pages/PascalCase.tsx → /camelCase
// (Home.tsx 는 예외적으로 루트 경로 '/' 로 매핑됩니다)
const pageModules = import.meta.glob('/src/pages/**/*.tsx')

function toPath(filePath: string): string {
  const fileName = filePath
    .split('/')
    .pop()!
    .replace(/\.tsx$/, '')
  if (fileName === 'Home') return '/'
  return `/${fileName.charAt(0).toLowerCase()}${fileName.slice(1)}`
}

const routes = Object.entries(pageModules).map(([filePath, loader]) => {
  const Component = lazy(loader as () => Promise<{ default: React.ComponentType }>)
  return {
    path: toPath(filePath),
    isLoginPage: filePath.endsWith('/Login.tsx'),
    element: (
      <Suspense fallback={null}>
        <Component />
      </Suspense>
    ),
  }
})

// 로그인 화면은 앱 셸(MainLayout) 밖에서 단독으로 렌더링하고, 그 외 화면은 로그인해야만 접근 가능하다.
const loginRoute = routes.find((route) => route.isLoginPage)
const protectedRoutes = routes.filter((route) => !route.isLoginPage)

const router = createBrowserRouter([
  {
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: protectedRoutes,
  },
  ...(loginRoute
    ? [
        {
          path: loginRoute.path,
          element: <GuestGuard>{loginRoute.element}</GuestGuard>,
        },
      ]
    : []),
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
