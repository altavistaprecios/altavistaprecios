import type { ReactNode } from "react"

import { ClientSiteHeader } from "@/components/client-site-header"
import { ClientSidebar } from "@/components/client-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ClientLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <SidebarProvider>
      <ClientSidebar variant="inset" />
      <SidebarInset>
        <ClientSiteHeader title="Client Portal" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}