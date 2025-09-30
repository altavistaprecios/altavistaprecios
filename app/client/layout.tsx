import type { ReactNode } from "react"
import { getTranslations } from "next-intl/server"

import { ClientSiteHeader } from "@/components/client-site-header"
import { ClientSidebar } from "@/components/client-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function ClientLayout({
  children,
}: {
  children: ReactNode
}) {
  const t = await getTranslations("clientHeader")

  return (
    <SidebarProvider>
      <ClientSidebar variant="inset" />
      <SidebarInset>
        <ClientSiteHeader title={t("defaultTitle")} />
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
