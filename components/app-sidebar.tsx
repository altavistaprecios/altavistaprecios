"use client"

import * as React from "react"
import {
  Package,
  Users,
  LayoutDashboardIcon,
  UserPlus,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/providers/auth-provider"
import { useRegistrationCount } from "@/hooks/use-registration-count"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const { pendingCount } = useRegistrationCount()
  const t = useTranslations()

  const data = {
    user: {
      name: user?.email?.split('@')[0] || "User",
      email: user?.email || "user@example.com",
      avatar: "",
    },
    navMain: [
      {
        title: t('nav.dashboard'),
        url: "/admin",
        icon: LayoutDashboardIcon,
        isActive: true,
      },
      {
        title: t('nav.registrations'),
        url: "/admin/registrations",
        icon: UserPlus,
        badge: pendingCount > 0 ? pendingCount : undefined,
      },
      {
        title: t('nav.products'),
        url: "/admin/products",
        icon: Package,
        items: [
          {
            title: t('nav.allProducts'),
            url: "/admin/products",
          },
          {
            title: t('nav.monofocalesFutureX'),
            url: "/admin/monofocales-future-x",
          },
          {
            title: t('nav.monofocalesTerminados'),
            url: "/admin/monofocales-terminados",
          },
        ],
      },
      {
        title: t('nav.clients'),
        url: "/admin/clients",
        icon: Users,
        items: [
          {
            title: t('nav.allClients'),
            url: "/admin/clients",
          },
          {
            title: t('nav.preAuthorizeClient'),
            url: "/admin/clients/authorize",
          },
        ],
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Package className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{t('header.altavistaOptics')}</span>
                  <span className="truncate text-xs">{t('header.b2bPortal')}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
