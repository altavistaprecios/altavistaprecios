import { AdminStats } from "@/components/admin-stats"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your B2B products and clients</p>
          </div>
          <Badge className="flex items-center gap-2 px-3 py-1.5 text-sm" variant="secondary">
            <Calendar className="h-4 w-4" />
            VALID FROM 08.01.2025
          </Badge>
        </div>
      </div>
      <AdminStats />
    </div>
  )
}