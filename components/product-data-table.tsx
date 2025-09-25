"use client"

import * as React from "react"
import { DataTable } from "./data-table"

interface ProductDataTableProps {
  data: any[]
}

export function ProductDataTable({ data }: ProductDataTableProps) {
  // Transform the column headers for products
  const transformedData = React.useMemo(() => {
    return data.map(item => ({
      ...item,
      // Keep the same structure but we'll override the display in the parent
    }))
  }, [data])

  return <DataTable data={transformedData} />
}