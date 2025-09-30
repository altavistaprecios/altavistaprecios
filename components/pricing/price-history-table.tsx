'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTableShell } from '@/components/ui/data-table-shell'
import { PriceHistory } from '@/lib/models/price-history'
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useTranslations, useFormatter } from 'next-intl'

interface PriceHistoryTableProps {
  history: PriceHistory[]
}

export function PriceHistoryTable({ history }: PriceHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'increase' | 'decrease' | 'no-change'>('all')
  const t = useTranslations('clientHistoryTable')
  const formatter = useFormatter()

  const filteredHistory = history.filter(item => {
    const matchesSearch =
      item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client_name?.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (filterType === 'all') return true

    const priceDiff = item.new_price - item.old_price

    switch (filterType) {
      case 'increase':
        return priceDiff > 0
      case 'decrease':
        return priceDiff < 0
      case 'no-change':
        return priceDiff === 0
      default:
        return true
    }
  })

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
        <Badge variant="destructive" className="ml-2">
          {t('changeIncrease', {
            amount: formatter.number(diff, { style: 'currency', currency: 'USD' }),
            percent: percentChange,
          })}
        </Badge>
      )
    }
    if (diff < 0) {
      return (
        <Badge className="ml-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-900 dark:bg-emerald-950 dark:text-emerald-100 dark:text-emerald-200">
          {t('changeDecrease', {
            amount: formatter.number(Math.abs(diff), { style: 'currency', currency: 'USD' }),
            percent: percentChange,
          })}
        </Badge>
      )
    }
    return <Badge variant="secondary" className="ml-2">{t('changeNone')}</Badge>
  }

  return (
    <DataTableShell
      filters={
        <>
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder={t('filterPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.all')}</SelectItem>
              <SelectItem value="increase">{t('filters.increase')}</SelectItem>
              <SelectItem value="decrease">{t('filters.decrease')}</SelectItem>
              <SelectItem value="no-change">{t('filters.none')}</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
      footerLeft={
        <span>
          {t('footerShowing', {
            filtered: filteredHistory.length,
            total: history.length,
          })}
        </span>
      }
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/80">
          <TableRow>
            <TableHead>{t('columns.date')}</TableHead>
            <TableHead>{t('columns.product')}</TableHead>
            <TableHead>{t('columns.client')}</TableHead>
            <TableHead className="text-right">{t('columns.oldPrice')}</TableHead>
            <TableHead className="text-right">{t('columns.newPrice')}</TableHead>
            <TableHead>{t('columns.change')}</TableHead>
            <TableHead>{t('columns.changedBy')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredHistory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                {t('empty')}
              </TableCell>
            </TableRow>
          ) : (
            filteredHistory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {formatter.dateTime(new Date(item.changed_at), { dateStyle: 'medium' })}
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-medium">{item.product_code}</span>
                    <p className="text-sm text-muted-foreground">
                      {item.product_name}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{item.client_name || t('unknownClient')}</TableCell>
                <TableCell className="text-right">
                  {formatter.number(item.old_price, { style: 'currency', currency: 'USD' })}
                </TableCell>
                <TableCell className="text-right">
                  {formatter.number(item.new_price, { style: 'currency', currency: 'USD' })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getPriceChangeIcon(item.old_price, item.new_price)}
                    {getPriceChangeBadge(item.old_price, item.new_price)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {item.changed_by_name || item.changed_by}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  )
}
