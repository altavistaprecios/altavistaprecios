import { ColumnDef } from "@tanstack/react-table"
import { z } from "zod"

export interface TableConfig<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[]
  schema: z.ZodSchema<TData>
  enableDragAndDrop?: boolean
  enableSelection?: boolean
  enableInlineEdit?: boolean
  enableDetailView?: boolean
  defaultPageSize?: number
}

export interface TableFilter {
  id: string
  label: string
  options?: Array<{
    value: string
    label: string
  }>
}

export interface TableTab {
  value: string
  label: string
  badge?: number
  content?: React.ReactNode
}

export interface TableAction<TData> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (row: TData) => void
  variant?: "default" | "destructive"
  className?: string
}

export interface TableBulkAction<TData> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (rows: TData[]) => void
  variant?: "default" | "destructive"
}

export interface DataTableProps<TData> {
  data: TData[]
  config: TableConfig<TData>
  filters?: TableFilter[]
  tabs?: TableTab[]
  actions?: TableAction<TData>[]
  bulkActions?: TableBulkAction<TData>[]
  onDataChange?: (data: TData[]) => void
  searchPlaceholder?: string
  heading?: React.ReactNode
  description?: string
  toolbar?: React.ReactNode
}