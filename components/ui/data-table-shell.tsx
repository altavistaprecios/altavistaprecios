import * as React from "react"

import { cn } from "@/lib/utils"

interface DataTableShellProps {
  title?: React.ReactNode
  description?: React.ReactNode
  heading?: React.ReactNode
  toolbar?: React.ReactNode
  filters?: React.ReactNode
  footerLeft?: React.ReactNode
  footerRight?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentWrapperClassName?: string
  contentClassName?: string
  filtersClassName?: string
}

export function DataTableShell({
  title,
  description,
  heading,
  toolbar,
  filters,
  footerLeft,
  footerRight,
  children,
  className,
  contentWrapperClassName,
  contentClassName,
  filtersClassName,
}: DataTableShellProps) {
  const resolvedHeading = React.useMemo(() => {
    if (heading) return heading
    if (!title && !description) return null

    return (
      <div className="space-y-1">
        {title ? <div className="text-lg font-semibold lg:text-xl">{title}</div> : null}
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    )
  }, [heading, title, description])

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {(resolvedHeading || toolbar) && (
        <div className="flex flex-col gap-2 px-4 lg:px-6 sm:flex-row sm:items-center sm:justify-between">
          {resolvedHeading ? <div className="flex-1">{resolvedHeading}</div> : <div />}
          {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
        </div>
      )}
      {filters ? (
        <div
          className={cn(
            "flex flex-col gap-3 px-4 lg:px-6 sm:flex-row sm:items-center sm:justify-between",
            filtersClassName,
          )}
        >
          {filters}
        </div>
      ) : null}
      <div className={cn("px-4 lg:px-6", contentWrapperClassName)}>
        <div className={cn("overflow-hidden rounded-lg border", contentClassName)}>
          <div className="relative w-full overflow-auto">
            {children}
          </div>
          {(footerLeft || footerRight) && (
            <div className="flex items-center justify-between px-4">
              <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">{footerLeft}</div>
              <div className="flex w-full items-center gap-8 lg:w-fit">
                {footerRight ? <div className="flex items-center gap-2">{footerRight}</div> : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
