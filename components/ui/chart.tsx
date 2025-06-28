"use client"

import type * as React from "react"
import { TooltipContent, TooltipProvider, Tooltip } from "@/components/ui/tooltip"

interface ChartContainerProps {
  children: React.ReactNode
  data: any[]
  tooltipClassName?: string
}

export function ChartContainer({ children, data, tooltipClassName }: ChartContainerProps) {
  return <TooltipProvider>{children}</TooltipProvider>
}

interface ChartTooltipProps {
  content: React.ReactNode
}

export function ChartTooltip({ content }: ChartTooltipProps) {
  return <Tooltip>{content}</Tooltip>
}

interface ChartTooltipContentProps {
  labelFormatter?: (label: string | number | undefined) => string
  formatter?: (value: string | number | undefined) => (string | number | undefined)[]
  className?: string
  children?: React.ReactNode
}

export function ChartTooltipContent({ labelFormatter, formatter, className, children }: ChartTooltipContentProps) {
  return (
    <TooltipContent className={className}>
      {children || (
        <>
          <p className="font-bold">{labelFormatter ? labelFormatter("label") : "Label"}</p>
          <p>{formatter ? formatter("value") : "Value"}</p>
        </>
      )}
    </TooltipContent>
  )
}

export const Chart = () => null
