"use client"

import * as React from "react"
import {
  Package,
  DollarSign,
  LayoutDashboardIcon,
  History,
  TrendingUp,
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

export function ClientSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const t = useTranslations()

  const data = {
    user: {
      name: user?.company_name || user?.email?.split('@')[0] || "Client",
      email: user?.email || "client@example.com",
      avatar: "",
    },
    navMain: [
      {
        title: t('nav.dashboard'),
        url: "/client",
        icon: LayoutDashboardIcon,
        isActive: true,
      },
      {
        title: t('nav.products'),
        url: "/client/products",
        icon: Package,
        items: [
          {
            title: t('nav.allProducts'),
            url: "/client/products",
          },
          {
            title: t('nav.monofocalesFutureX'),
            url: "/client/monofocales-future-x",
          },
          {
            title: t('nav.monofocalesTerminados'),
            url: "/client/monofocales-terminados",
          },
        ],
      },
      {
        title: t('nav.pricing'),
        url: "/client/pricing",
        icon: DollarSign,
      },
      {
        title: t('nav.history'),
        url: "/client/history",
        icon: History,
        items: [
          {
            title: t('history.title'),
            url: "/client/history",
          },
          {
            title: t('dashboard.recentActivity'),
            url: "/client/history?filter=recent",
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
              <a href="/client">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <TrendingUp className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{t('header.altavistaOptics')}</span>
                  <span className="truncate text-xs">{t('sidebar.clientPortal')}</span>
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