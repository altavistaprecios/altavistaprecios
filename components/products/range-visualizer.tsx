"use client"

import * as React from "react"
import { Circle, Activity } from "lucide-react"

interface RangeVisualizerProps {
  min: number | string
  max: number | string
  isFixed?: boolean
  label?: string
  scale?: { min: number; max: number }
}

export const RangeVisualizer: React.FC<RangeVisualizerProps> = ({
  min,
  max,
  isFixed = false,
  label,
  scale = { min: -12, max: 12 } // Default scale for optical lenses
}) => {
  const minValue = typeof min === 'string' ? parseFloat(min) : min
  const maxValue = typeof max === 'string' ? parseFloat(max) : max

  const totalRange = scale.max - scale.min
  const minPos = ((minValue - scale.min) / totalRange) * 100
  const maxPos = ((maxValue - scale.min) / totalRange) * 100

  // For fixed cylindrical values
  if (isFixed) {
    const fixedPos = ((minValue - scale.min) / totalRange) * 100
    return (
      <div className="relative">
        {/* Scale marks */}
        <div className="absolute flex justify-between w-full -top-5 text-xs text-zinc-500">
          <span>{scale.min}</span>
          <span>0</span>
          <span>+{scale.max}</span>
        </div>
        {/* Background bar */}
        <div className="relative h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-6">
          {/* Fixed value indicator */}
          <div
            className="absolute h-full w-1 bg-zinc-900 dark:bg-zinc-100"
            style={{ left: `${Math.max(0, Math.min(100, fixedPos))}%` }}
          />
        </div>
        {/* Value label */}
        <div className="text-center mt-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {minValue > 0 ? `+${minValue.toFixed(2)}` : minValue.toFixed(2)}
          </span>
        </div>
      </div>
    )
  }

  // For range values (spherical)
  return (
    <div className="relative">
      {/* Scale marks */}
      <div className="absolute flex justify-between w-full -top-5 text-xs text-zinc-500 dark:text-zinc-400">
        <span>{scale.min}</span>
        <span>0</span>
        <span>+{scale.max}</span>
      </div>
      {/* Background bar */}
      <div className="relative h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-6">
        {/* Range indicator */}
        <div
          className="absolute h-full bg-gradient-to-r from-zinc-800 to-zinc-600 dark:from-zinc-200 dark:to-zinc-400 rounded-full"
          style={{
            left: `${Math.max(0, Math.min(100, minPos))}%`,
            width: `${Math.max(0, Math.min(100 - minPos, maxPos - minPos))}%`
          }}
        />
      </div>
      {/* Min and Max labels */}
      <div className="flex justify-between mt-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {minValue > 0 ? `+${minValue.toFixed(2)}` : minValue.toFixed(2)}
        </span>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {maxValue > 0 ? `+${maxValue.toFixed(2)}` : maxValue.toFixed(2)}
        </span>
      </div>
    </div>
  )
}

interface LensRangeDisplayProps {
  sphericalMin: number | string
  sphericalMax: number | string
  cylindricalMin: number | string
  cylindricalMax?: number | string
  isLaboratory?: boolean
}

export const LensRangeDisplay: React.FC<LensRangeDisplayProps> = ({
  sphericalMin,
  sphericalMax,
  cylindricalMin,
  cylindricalMax,
  isLaboratory = false
}) => {
  // Use wider scale for laboratory lenses
  const scale = isLaboratory
    ? { min: -14, max: 10 }
    : { min: -8, max: 8 }

  const isCylindricalFixed = !cylindricalMax || cylindricalMin === cylindricalMax

  return (
    <div className="space-y-6">
      {/* Spherical Range */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Circle className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Esférico (Sph)
          </span>
        </div>
        <div className="pl-6">
          <RangeVisualizer
            min={sphericalMin}
            max={sphericalMax}
            scale={scale}
          />
        </div>
      </div>

      {/* Cylindrical Value or Range */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Cilíndrico (Cyl)
          </span>
        </div>
        <div className="pl-6">
          <RangeVisualizer
            min={cylindricalMin}
            max={cylindricalMax || cylindricalMin}
            isFixed={isCylindricalFixed}
            scale={{ min: -8, max: 0 }} // Cylindrical values are typically negative
          />
        </div>
      </div>
    </div>
  )
}