'use client'

import * as React from 'react'
import { z } from 'zod'
import { ColumnDef } from '@tanstack/react-table'
import { UniversalDataTable, DragHandle } from '@/components/ui/universal-data-table'
import { TableConfig, TableTab } from '@/lib/table/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpDown,
  FileText,
  Download,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { PriceHistory } from '@/lib/models/price-history'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

const priceHistorySchema = z.object({
  id: z.string(),
  product_id: z.string(),
  product_code: z.string().optional(),
  product_name: z.string().optional(),
  client_id: z.string().nullable(),
  client_name: z.string().nullable(),
  old_price: z.number(),
  new_price: z.number(),
  changed_by: z.string(),
  changed_by_name: z.string().optional(),
  changed_at: z.string(),
  reason: z.string().optional(),
})

type PriceHistoryData = z.infer<typeof priceHistorySchema>

const chartData = [
  { month: "Jan", price: 186 },
  { month: "Feb", price: 305 },
  { month: "Mar", price: 237 },
  { month: "Apr", price: 273 },
  { month: "May", price: 209 },
  { month: "Jun", price: 214 },
]

const chartConfig = {
  price: {
    label: "Price",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function PriceChangeDetailViewer({ item }: { item: PriceHistoryData }) {
  const priceDiff = item.new_price - item.old_price
  const percentChange = ((priceDiff / item.old_price) * 100).toFixed(1)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground">
          {item.product_name || item.product_code}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="gap-1">
          <SheetTitle>{item.product_name || item.product_code}</SheetTitle>
          <SheetDescription>
            Price change on {format(new Date(item.changed_at), 'MMM d, yyyy')}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 0,
                  right: 10,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="price"
                  type="natural"
                  fill="var(--color-price)"
                  fillOpacity={0.4}
                  stroke="var(--color-price)"
                />
              </AreaChart>
            </ChartContainer>

            <div className="grid gap-4 rounded-lg border p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Old Price</Label>
                  <p className="text-2xl font-semibold">${item.old_price.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">New Price</Label>
                  <p className="text-2xl font-semibold">${item.new_price.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Change</Label>
                <div className="flex items-center gap-2">
                  {priceDiff > 0 ? (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  ) : priceDiff < 0 ? (
                    <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={priceDiff > 0 ? 'text-destructive' : priceDiff < 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                    {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(2)} ({percentChange}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Product</Label>
                <p className="text-sm">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">{item.product_code}</p>
              </div>
              {item.client_name && (
                <div>
                  <Label className="text-xs text-muted-foreground">Client</Label>
                  <p className="text-sm">{item.client_name}</p>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">Changed By</Label>
                <p className="text-sm">{item.changed_by_name || item.changed_by}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Date & Time</Label>
                <p className="text-sm">
                  {format(new Date(item.changed_at), 'PPpp')}
                </p>
              </div>
              {item.reason && (
                <div>
                  <Label className="text-xs text-muted-foreground">Reason</Label>
                  <p className="text-sm">{item.reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <SheetFooter className="mt-auto">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

interface PriceHistoryTableV2Props {
  history: PriceHistory[]
  onExport?: () => void
  onGenerateReport?: () => void
}

export function PriceHistoryTableV2({
  history,
  onExport,
  onGenerateReport,
}: PriceHistoryTableV2Props) {
  const getPriceChangeIcon = (oldPrice: number, newPrice: number) => {
    const diff = newPrice - oldPrice
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-destructive" />
    if (diff < 0) return <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getPriceChangeBadge = (oldPrice: number, newPrice: number) => {
    const diff = newPrice - oldPrice
    const percentChange = ((diff / oldPrice) * 100).toFixed(1)

    if (diff > 0) {
      return (
        <Badge variant="destructive">
          +${diff.toFixed(2)} ({percentChange}%)
        </Badge>
      )
    }
    if (diff < 0) {
      return (
        <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-900 dark:bg-emerald-950 dark:text-emerald-100 dark:text-emerald-200">
          -${Math.abs(diff).toFixed(2)} ({percentChange}%)
        </Badge>
      )
    }
    return <Badge variant="secondary">No change</Badge>
  }

  const columns: ColumnDef<PriceHistoryData>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "changed_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return format(new Date(row.original.changed_at), 'MMM d, yyyy')
      },
    },
    {
      accessorKey: "product_name",
      header: "Product",
      cell: ({ row }) => {
        return <PriceChangeDetailViewer item={row.original} />
      },
      enableHiding: false,
    },
    {
      accessorKey: "client_name",
      header: "Client",
      cell: ({ row }) => row.original.client_name || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "old_price",
      header: () => <div className="text-right">Old Price</div>,
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            ${row.original.old_price.toFixed(2)}
          </div>
        )
      },
    },
    {
      accessorKey: "new_price",
      header: () => <div className="text-right">New Price</div>,
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            ${row.original.new_price.toFixed(2)}
          </div>
        )
      },
    },
    {
      id: "change",
      header: "Change",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            {getPriceChangeIcon(row.original.old_price, row.original.new_price)}
            {getPriceChangeBadge(row.original.old_price, row.original.new_price)}
          </div>
        )
      },
    },
    {
      accessorKey: "changed_by_name",
      header: "Changed By",
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {row.original.changed_by_name || row.original.changed_by}
          </div>
        )
      },
    },
  ]

  const config: TableConfig<PriceHistoryData> = {
    columns,
    schema: priceHistorySchema,
    enableDragAndDrop: true,
    enableSelection: true,
    enableDetailView: true,
    defaultPageSize: 20,
  }

  const increasesCount = history.filter(h => h.new_price > h.old_price).length
  const decreasesCount = history.filter(h => h.new_price < h.old_price).length
  const noChangeCount = history.filter(h => h.new_price === h.old_price).length

  const tabs: TableTab[] = [
    {
      value: "all",
      label: "All Changes",
      badge: history.length,
    },
    {
      value: "increases",
      label: "Increases",
      badge: increasesCount,
    },
    {
      value: "decreases",
      label: "Decreases",
      badge: decreasesCount,
    },
    {
      value: "no-change",
      label: "No Change",
      badge: noChangeCount,
    },
  ]

  return (
    <UniversalDataTable
      data={history as PriceHistoryData[]}
      config={config}
      tabs={tabs}
      searchPlaceholder="Search by product or client..."
      heading={<h1 className="text-3xl font-bold tracking-tight">Price History</h1>}
      description="Track and analyze all price changes across products and clients"
      toolbar={
        <>
          <Button size="sm" variant="outline" onClick={onGenerateReport}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button size="sm" variant="outline" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </>
      }
    />
  )
}