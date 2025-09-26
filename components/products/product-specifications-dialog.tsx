"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LensRangeDisplay } from "@/components/products/range-visualizer"
import { Button } from "@/components/ui/button"
import { ChevronRight, X } from "lucide-react"
import productDescriptions from "@/public/product-descriptions.json"

interface Product {
  id: string
  code: string
  name: string
  category_id: string
  base_price_usd: number
  is_active: boolean
}

interface ProductSpecificationsDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Map product codes to description keys
const codeToDescriptionKey: Record<string, string> = {
  "FVTS": "steel",
  "FVTXS": "x-treme",
  "FVTP": "paladin",
  "FVTG25": "g2",
  "FVSG2": "g2",
  "FVTBS": "g3-blusteel",
  "FVTBSRX": "g3-blusteel",
  "FVS": "standard",
  "FVS157A": "aspheric"
}

// Technical specifications by product type with parsed values
const technicalSpecs: Record<string, any> = {
  "FVTS": {
    range: "Esf -4.00 a +3.00 Cil -2.00",
    spherical: { min: -4.00, max: 3.00 },
    cylindrical: { min: -2.00, max: -2.00 },
    bases: "0.50/2.00/4.00",
    diameter: "70mm",
    material: "1.56",
    treatment: "Steel (Super hidrofóbico, oleofóbico, antiestático)",
    features: ["Resistente", "Antirreflejo", "Protección UV"]
  },
  "FVTG25": {
    range: "Esf +/-4.00 Cil -2.00",
    spherical: { min: -4.00, max: 4.00 },
    cylindrical: { min: -2.00, max: -2.00 },
    bases: "0.50/2.00/4.00",
    diameter: "70mm",
    material: "1.56",
    treatment: "Steel",
    features: ["2x Resistente", "Asférico", "Mayor campo visual"],
    description: "2x más resistente a impactos, totalmente asférico"
  },
  "FVTBS": {
    range: "Esf +/-4.00 Cil -2.00",
    spherical: { min: -4.00, max: 4.00 },
    cylindrical: { min: -2.00, max: -2.00 },
    bases: "0.50/2.00/4.00",
    diameter: "70mm",
    material: "1.56",
    treatment: "BluSteel (Protección luz azul 380-500nm)",
    features: ["Luz Azul", "Anti-fatiga", "Visión clara"],
    description: "Previene fatiga visual digital"
  },
  "FVTBSRX": {
    range: "Esf -4.00 a +3.00 Cil -2.5 a -4.00",
    spherical: { min: -4.00, max: 3.00 },
    cylindrical: { min: -4.00, max: -2.50 },
    bases: "0.50/2.00/4.00",
    diameter: "70mm",
    material: "1.56",
    treatment: "BluSteel (Protección luz azul 380-500nm)",
    features: ["Rango extendido", "Luz Azul", "Anti-fatiga"],
    description: "Rango extendido"
  },
  "FVTP": {
    range: "Esf +/-4.00 Cil -2.00",
    spherical: { min: -4.00, max: 4.00 },
    cylindrical: { min: -2.00, max: -2.00 },
    bases: "0.50/2.00/4.00",
    diameter: "70mm",
    material: "1.56",
    treatment: "Paladin (AR cerámico, hidrofílico, antiempañante)",
    features: ["AR Cerámico", "Antiempañante", "2x Rayado"],
    description: "Duplica resistencia al rayado"
  },
  "FVTXS": {
    range: "Esf -6.00 a +6.00 Cil -0.25 a -4.00",
    spherical: { min: -6.00, max: 6.00 },
    cylindrical: { min: -4.00, max: -0.25 },
    bases: "0.50/2.00/4.00",
    diameter: "70mm",
    material: "1.56",
    treatment: "Steel",
    features: ["Alta graduación", "Asférico atórico", "Espesor optimizado"],
    description: "Asfericidad atórica, optimización de espesor"
  },
  "FVS": {
    range: "Esf -12.00 a +3.50 Cil -6.00",
    spherical: { min: -12.00, max: 3.50 },
    cylindrical: { min: -6.00, max: -6.00 },
    bases: "0.50/2.00/4.00/6.00/8.00",
    diameter: "70mm",
    material: "1.56/1.61/1.67",
    type: "Laboratorio",
    features: ["Laboratorio", "Múltiples índices", "Amplio rango"]
  },
  "FVS157A": {
    range: "Esf -3.25 a +10.00 Cil -6.00",
    spherical: { min: -3.25, max: 10.00 },
    cylindrical: { min: -6.00, max: -6.00 },
    bases: "5.00/6.00/8.00/10.00",
    diameter: "70mm",
    material: "1.56/1.61/1.67",
    type: "Laboratorio",
    features: ["Asférico", "Alta positiva", "Laboratorio"],
    description: "Diseño asférico"
  },
  "FVSG2": {
    range: "Esf -12.00 a +8.50 Cil -6.00",
    spherical: { min: -12.00, max: 8.50 },
    cylindrical: { min: -6.00, max: -6.00 },
    bases: "0.50/2.00/3.50/6.00/8.00/9.00",
    diameter: "70mm",
    material: "1.56/1.61/1.67",
    type: "Laboratorio",
    features: ["2x Resistente", "Asférico", "Laboratorio"],
    description: "2x más resistente, totalmente asférico"
  },
  // ClearView products
  "160VTCV": {
    range: "Especificación azul claro",
    spherical: { min: -10.00, max: 8.00 },
    cylindrical: { min: -4.00, max: 0 },
    material: "1.60",
    treatment: "Blue Guard",
    features: ["Blue Guard", "DuraVision", "Standard stock"]
  },
  "160VTCVRX": {
    range: "Blue specification",
    spherical: { min: -10.00, max: 8.00 },
    cylindrical: { min: -4.00, max: 0 },
    material: "1.60",
    treatment: "Blue Guard",
    features: ["Blue Guard", "DuraVision", "Rango extendido"]
  }
}

export function ProductSpecificationsDialog({
  product,
  open,
  onOpenChange
}: ProductSpecificationsDialogProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  if (!product) return null

  const descKey = codeToDescriptionKey[product.code]
  const productDesc = descKey ? productDescriptions["future-x"].products[descKey as keyof typeof productDescriptions["future-x"]["products"]] : null
  const specs = technicalSpecs[product.code]
  const isLaboratory = specs?.type === "Laboratorio"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          <DialogDescription>
            Code: {product.code} | Base Price: ${product.base_price_usd} USD
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visual Range Display */}
          {specs?.spherical && (
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
                <CardTitle className="text-lg">Prescription Ranges</CardTitle>
                <CardDescription>
                  Available range visualization for this product
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <LensRangeDisplay
                  sphericalMin={specs.spherical.min}
                  sphericalMax={specs.spherical.max}
                  cylindricalMin={specs.cylindrical.min}
                  cylindricalMax={specs.cylindrical.max}
                  isLaboratory={isLaboratory}
                />
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {specs?.features && (
            <div className="flex flex-wrap gap-2">
              {specs.features.map((feature: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="px-3 py-1 border-zinc-200 dark:border-zinc-700"
                >
                  {feature}
                </Badge>
              ))}
            </div>
          )}

          {/* Main description */}
          {productDesc && (
            <Card>
              <CardHeader>
                <CardTitle>{productDesc.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {productDesc.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Technical specifications */}
          {specs && (
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Range</p>
                    <p className="text-sm text-muted-foreground">{specs.range}</p>
                  </div>
                  {specs.bases && (
                    <div>
                      <p className="text-sm font-medium">Bases</p>
                      <p className="text-sm text-muted-foreground">{specs.bases}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">Diameter</p>
                    <p className="text-sm text-muted-foreground">{specs.diameter}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Material</p>
                    <p className="text-sm text-muted-foreground">{specs.material}</p>
                  </div>
                  {specs.treatment && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium">Treatment</p>
                      <p className="text-sm text-muted-foreground">{specs.treatment}</p>
                    </div>
                  )}
                  {specs.description && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium">Special Features</p>
                      <p className="text-sm text-muted-foreground">{specs.description}</p>
                    </div>
                  )}
                  {specs.type && (
                    <div>
                      <p className="text-sm font-medium">Tipo</p>
                      <Badge variant="outline">{specs.type}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expanded Details Button */}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full ${isExpanded ? 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900'}`}
            variant="outline"
          >
            {isExpanded ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cerrar detalles técnicos
              </>
            ) : (
              <>
                Ver detalles técnicos completos
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          {/* Expanded Technical Details */}
          {isExpanded && (
            <>
              {/* Future-X general description */}
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Sobre Future-X</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {productDescriptions["future-x"].description}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}