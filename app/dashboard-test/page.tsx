"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminSiteHeader } from "@/components/admin-site-header"

export default function DashboardTestPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <AdminSiteHeader title="Dashboard Test" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">Shadcn Dashboard Test</h1>
                    <p className="text-muted-foreground">
                      Official shadcn dashboard-01 components
                    </p>
                  </div>
                </div>
              </div>
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}