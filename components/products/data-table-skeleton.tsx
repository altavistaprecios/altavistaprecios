import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function DataTableSkeleton() {
  return (
    <div className="flex w-full flex-col justify-start gap-6">
      {/* Header with search and actions */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex flex-1 items-center space-x-2">
          {/* Search input skeleton */}
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        {/* Columns button skeleton */}
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table skeleton */}
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              <TableRow>
                {/* Checkbox column */}
                <TableHead className="w-12">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
                {/* Code column */}
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                {/* Name column */}
                <TableHead>
                  <Skeleton className="h-4 w-32" />
                </TableHead>
                {/* Specifications column */}
                <TableHead>
                  <Skeleton className="h-4 w-28" />
                </TableHead>
                {/* Price column */}
                <TableHead className="text-right">
                  <Skeleton className="h-4 w-24 ml-auto" />
                </TableHead>
                {/* Status column */}
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                {/* Actions column */}
                <TableHead className="w-20">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Generate 6 skeleton rows */}
              {Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  {/* Checkbox */}
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  {/* Code */}
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  {/* Name */}
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  {/* Specifications */}
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  {/* Price */}
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </TableCell>
                  {/* Status badge */}
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between px-4">
          <Skeleton className="hidden h-4 w-48 lg:block" />
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-20" />
            </div>
            <Skeleton className="h-4 w-24" />
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Skeleton className="hidden h-8 w-8 lg:block" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="hidden h-8 w-8 lg:block" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}