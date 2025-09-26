'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Home,
  Package,
  Users,
  DollarSign,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Glasses
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  adminOnly?: boolean
  clientOnly?: boolean
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'MONOFOCALES FUTURE-X',
    href: '/admin/monofocales-future-x',
    icon: Glasses,
    adminOnly: true,
  },
  {
    title: 'MONOFOCALES TERMINADOS',
    href: '/admin/monofocales-terminados',
    icon: Sparkles,
    adminOnly: true,
  },
  {
    title: 'Clients',
    href: '/admin/clients',
    icon: Users,
    adminOnly: true,
  },
  {
    title: 'Product Catalog',
    href: '/client/products',
    icon: Package,
    clientOnly: true,
  },
  {
    title: 'My Pricing',
    href: '/client/pricing',
    icon: DollarSign,
    clientOnly: true,
  },
  {
    title: 'Price History',
    href: '/admin/history',
    icon: History,
    adminOnly: true,
  },
  {
    title: 'My History',
    href: '/client/history',
    icon: History,
    clientOnly: true,
  },
]

interface SidebarProps {
  className?: string
  collapsed?: boolean
  onToggleCollapse?: (collapsed: boolean) => void
}

export function Sidebar({
  className,
  collapsed: controlledCollapsed,
  onToggleCollapse
}: SidebarProps) {
  const [localCollapsed, setLocalCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const router = useRouter()

  const isAdmin = user?.role === 'admin'
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : localCollapsed

  const handleToggleCollapse = () => {
    const newState = !collapsed
    if (onToggleCollapse) {
      onToggleCollapse(newState)
    } else {
      setLocalCollapsed(newState)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const filteredItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false
    if (item.clientOnly && isAdmin) return false
    return true
  })

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 z-40 h-full bg-white dark:bg-zinc-950 border-r transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            {!collapsed && (
              <div>
                <h2 className="text-lg font-semibold">Altavista Optics</h2>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? 'Administration' : 'B2B Portal'}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={handleToggleCollapse}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2">
            {filteredItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-2 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-start gap-3',
                collapsed && 'justify-center'
              )}
              onClick={() => router.push('/settings')}
              title={collapsed ? 'Settings' : undefined}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Settings</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-start gap-3',
                collapsed && 'justify-center'
              )}
              onClick={handleSignOut}
              title={collapsed ? 'Sign Out' : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </Button>
          </div>

          {/* User info */}
          {!collapsed && user && (
            <div className="border-t p-4">
              <div className="text-xs">
                <p className="font-medium truncate">{user.email}</p>
                <p className="text-muted-foreground truncate">{user.company_name}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}