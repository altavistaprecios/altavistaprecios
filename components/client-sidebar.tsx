"use client"

import * as React from "react"
import {
  Package,
  DollarSign,
  LayoutDashboardIcon,
  History,
  TrendingUp,
} from "lucide-react"

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

  const data = {
    user: {
      name: user?.company_name || user?.email?.split('@')[0] || "Client",
      email: user?.email || "client@example.com",
      avatar: "",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/client",
        icon: LayoutDashboardIcon,
        isActive: true,
      },
      {
        title: "Products",
        url: "/client/products",
        icon: Package,
      },
      {
        title: "Pricing",
        url: "/client/pricing",
        icon: DollarSign,
      },
      {
        title: "Price History",
        url: "/client/history",
        icon: History,
        items: [
          {
            title: "View All History",
            url: "/client/history",
          },
          {
            title: "Recent Changes",
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
                  <span className="truncate font-semibold">Altavista Optics</span>
                  <span className="truncate text-xs">Client Portal</span>
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