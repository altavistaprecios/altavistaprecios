"use client"

import { GrainGradient } from "@paper-design/shaders-react"
import type { CSSProperties } from "react"

interface LoginGradientPlaceholderProps {
  className?: string
  style?: CSSProperties
}

export function LoginGradientPlaceholder({
  className,
  style,
}: LoginGradientPlaceholderProps) {
  return (
    <GrainGradient
      colors={["#E9E8EE", "#040006", "#5A5C5DAB", "#131415"]}
      colorBack="#00000000"
      speed={0.73}
      scale={1}
      rotation={0}
      offsetX={0}
      offsetY={0}
      softness={0.5}
      intensity={0.5}
      noise={0.25}
      shape="corners"
      className={className}
      style={{
        backgroundColor: "#000000",
        height: "100%",
        width: "100%",
        ...style,
      }}
    />
  )
}
