'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Home,
  Package,
  Users,
  DollarSign,
  History,
  Menu,
  X,
  LogOut,
  Settings
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface SidebarItem {
  titleKey: string
  href: string
  icon: React.ElementType
  adminOnly?: boolean
  clientOnly?: boolean
}

const sidebarItems: SidebarItem[] = [
  {
    titleKey: 'dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    titleKey: 'products',
    href: '/admin/products',
    icon: Package,
    adminOnly: true,
  },
  {
    titleKey: 'products',
    href: '/client/products',
    icon: Package,
    clientOnly: true,
  },
  {
    titleKey: 'clients',
    href: '/admin/clients',
    icon: Users,
    adminOnly: true,
  },
  {
    titleKey: 'pricing',
    href: '/client/pricing',
    icon: DollarSign,
    clientOnly: true,
  },
  {
    titleKey: 'priceHistory',
    href: '/admin/history',
    icon: History,
    adminOnly: true,
  },
  {
    titleKey: 'history',
    href: '/client/history',
    icon: History,
    clientOnly: true,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const router = useRouter()

  const isAdmin = user?.role === 'admin'

  const filteredItems = sidebarItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false
    if (item.clientOnly && isAdmin) return false
    return true
  })

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const navT = useTranslations('nav')
  const sidebarT = useTranslations('sidebar')
  const commonT = useTranslations('common')

  const SidebarContent = () => (
    <>
      <div className="px-6 py-4">
        <h2 className="text-lg font-semibold">{sidebarT('brand')}</h2>
        <p className="text-sm text-muted-foreground">
          {isAdmin ? sidebarT('adminPortal') : sidebarT('clientPortal')}
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                isActive
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
              )}
            >
              <Icon
                className={cn(
                  'mr-3 h-5 w-5',
                  isActive
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-300'
                )}
              />
              {navT(item.titleKey)}
            </Link>
          )
        })}
      </nav>
      <div className="border-t px-2 py-4 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => router.push('/settings')}
        >
          <Settings className="mr-3 h-5 w-5" />
          {sidebarT('settings')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-5 w-5" />
          {sidebarT('signOut')}
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex w-64 flex-col">
          <div className="flex flex-1 flex-col border-r bg-white dark:bg-zinc-950">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b bg-white px-4 dark:bg-zinc-950 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">{commonT('toggleSidebar')}</span>
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-lg font-semibold">{user?.email}</h1>
            <p className="text-sm text-muted-foreground">
              {user?.company_name}
            </p>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
