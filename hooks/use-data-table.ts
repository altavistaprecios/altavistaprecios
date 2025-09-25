import * as React from "react"
import {
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { TableConfig } from "@/lib/table/types"

interface UseDataTableProps<TData> {
  data: TData[]
  config: TableConfig<TData>
  onDataChange?: (data: TData[]) => void
}

export function useDataTable<TData>({
  data: initialData,
  config,
  onDataChange,
}: UseDataTableProps<TData>) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: config.defaultPageSize || 10,
  })

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  React.useEffect(() => {
    onDataChange?.(data)
  }, [data, onDataChange])

  const table = useReactTable({
    data,
    columns: config.columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row: any) => row.id?.toString() || Math.random().toString(),
    enableRowSelection: config.enableSelection ?? true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const selectedRows = React.useMemo(
    () => table.getFilteredSelectedRowModel().rows.map((row) => row.original),
    [table, rowSelection]
  )

  const updateData = React.useCallback((newData: TData[]) => {
    setData(newData)
  }, [])

  const updateRow = React.useCallback((rowId: string, updates: Partial<TData>) => {
    setData((prev) =>
      prev.map((item: any) =>
        item.id?.toString() === rowId ? { ...item, ...updates } : item
      )
    )
  }, [])

  return {
    table,
    data,
    setData: updateData,
    updateRow,
    selectedRows,
    rowSelection,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
    pagination,
    setPagination,
  }
}