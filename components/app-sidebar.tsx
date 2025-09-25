"use client"

import * as React from "react"
import {
  Package,
  Users,
  LayoutDashboardIcon,
  UserPlus,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const data = {
    user: {
      name: user?.email?.split('@')[0] || "User",
      email: user?.email || "user@example.com",
      avatar: "",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboardIcon,
        isActive: true,
      },
      {
        title: "Registrations",
        url: "/admin/registrations",
        icon: UserPlus,
      },
      {
        title: "Products",
        url: "/admin/products",
        icon: Package,
        items: [
          {
            title: "All Products",
            url: "/admin/products",
          },
          {
            title: "MONOFOCALES FUTURE-X",
            url: "/admin/monofocales-future-x",
          },
          {
            title: "MONOFOCALES TERMINADOS",
            url: "/admin/monofocales-terminados",
          },
        ],
      },
      {
        title: "Clientes",
        url: "/admin/clients",
        icon: Users,
        items: [
          {
            title: "Todos los Clientes",
            url: "/admin/clients",
          },
          {
            title: "Pre-autorizar Cliente",
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
                  <span className="truncate font-semibold">Altavista Optics</span>
                  <span className="truncate text-xs">B2B Portal</span>
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