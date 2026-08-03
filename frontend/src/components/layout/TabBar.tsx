import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Home, List, X } from 'lucide-react'
import { useUiStore } from '@/store/useUiStore'
import { clsx } from '@/utils/clsx'

export function TabBar() {
  const navigate = useNavigate()
  const { openTabs, activePath, closeTab, closeAllTabs } = useUiStore()
  const [showTabList, setShowTabList] = useState(false)
  const tabRefs = useRef(new Map<string, HTMLButtonElement>())

  useEffect(() => {
    tabRefs.current.get(activePath)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [activePath])

  return (
    <div className="relative flex items-center justify-between border-b border-gray-200 bg-white px-2">
      <div className="flex overflow-x-auto">
        {openTabs.map((tab) => (
          <button
            key={tab.path}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.path, el)
              else tabRefs.current.delete(tab.path)
            }}
            type="button"
            onClick={() => navigate(tab.path)}
            className={clsx(
              'group flex items-center gap-2 border-r border-gray-200 px-4 py-2 text-sm whitespace-nowrap',
              tab.path === activePath
                ? 'border-b-2 border-b-rose-600 font-medium text-rose-600'
                : 'text-gray-500 hover:bg-gray-50',
            )}
          >
            {tab.path === '/' ? <Home size={16} /> : <span>{tab.label}</span>}
            {tab.path !== '/' && (
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.path)
                  if (tab.path === activePath) navigate('/')
                }}
                className="text-gray-400 group-hover:text-gray-600"
              >
                <X size={14} />
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 px-2 text-gray-400">
        <button
          type="button"
          onClick={() => {
            const index = openTabs.findIndex((tab) => tab.path === activePath)
            if (index > 0) navigate(openTabs[index - 1].path)
          }}
          disabled={openTabs.findIndex((tab) => tab.path === activePath) <= 0}
          className="hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-gray-400"
          aria-label="이전 탭"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            const index = openTabs.findIndex((tab) => tab.path === activePath)
            if (index !== -1 && index < openTabs.length - 1) navigate(openTabs[index + 1].path)
          }}
          disabled={openTabs.findIndex((tab) => tab.path === activePath) >= openTabs.length - 1}
          className="hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-gray-400"
          aria-label="다음 탭"
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            closeAllTabs()
            navigate('/')
          }}
          className="hover:text-gray-600"
          aria-label="탭 모두 닫기"
        >
          <X size={16} />
        </button>
        <button
          type="button"
          onClick={() => setShowTabList((prev) => !prev)}
          className="hover:text-gray-600"
          aria-label="열린 탭 목록"
        >
          <List size={16} />
        </button>
      </div>

      {showTabList && (
        <div className="absolute top-full right-2 z-10 w-48 rounded border border-gray-200 bg-white py-1 shadow-lg">
          {openTabs.map((tab) => (
            <button
              key={tab.path}
              type="button"
              onClick={() => {
                navigate(tab.path)
                setShowTabList(false)
              }}
              className={clsx(
                'flex w-full items-center px-3 py-1.5 text-left text-sm hover:bg-gray-50',
                tab.path === activePath && 'font-medium text-rose-600',
              )}
            >
              {tab.path === '/' ? '홈' : tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
