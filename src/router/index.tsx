import { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'

// 파일 기반 라우팅: src/pages/PascalCase.tsx → /camelCase
// (Home.tsx 는 예외적으로 루트 경로 '/' 로 매핑됩니다)
const pageModules = import.meta.glob('/src/pages/**/*.tsx')

function toPath(filePath: string): string {
  const fileName = filePath.split('/').pop()!.replace(/\.tsx$/, '')
  if (fileName === 'Home') return '/'
  return `/${fileName.charAt(0).toLowerCase()}${fileName.slice(1)}`
}

const routes = Object.entries(pageModules).map(([filePath, loader]) => {
  const Component = lazy(loader as () => Promise<{ default: React.ComponentType }>)
  return {
    path: toPath(filePath),
    element: (
      <Suspense fallback={null}>
        <Component />
      </Suspense>
    ),
  }
})

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: routes,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
