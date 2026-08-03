import {
  Box,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  ListTree,
  Settings,
  User,
  Wallet,
  Workflow,
} from 'lucide-react'
import type { ComponentType } from 'react'

export const menuIcons: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  dashboard: LayoutDashboard,
  home: Home,
  admin: User,
  common: Settings,
  master: ListTree,
  system: Settings,
  sample: Box,
  project: FileText,
  plan: CreditCard,
  process: Workflow,
  vfxBudget: Wallet,
  sxBudget: Wallet,
}
