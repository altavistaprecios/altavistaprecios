'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Grid3x3, Table } from 'lucide-react'

export default function SpecificationsPage() {
  const [specData, setSpecData] = useState<any>(null)
  const [gridData, setGridData] = useState<any>(null)

  useEffect(() => {
    // Load specifications data
    fetch('/tabla_especificaciones.md')
      .then(res => res.text())
      .then(text => setSpecData(text))
      .catch(console.error)

    // Load grid data
    fetch('/specifications-grid.json')
      .then(res => res.json())
      .then(data => setGridData(data))
      .catch(console.error)
  }, [])

  const renderGrid = () => {
    if (!gridData) return null

    const { axes, matrix, legend } = gridData
    const sphereValues: number[] = []
    const cylinderValues: number[] = []

    // Generate sphere values
    for (let i = 0; i < axes.sphere.count; i++) {
      sphereValues.push(axes.sphere.start + (i * axes.sphere.step))
    }

    // Generate cylinder values
    for (let i = 0; i < axes.cylinder.count; i++) {
      cylinderValues.push(axes.cylinder.start + (i * axes.cylinder.step))
    }

    const getCellColor = (value: number) => {
      switch (value) {
        case 0: return 'bg-muted'
        case 1: return 'bg-emerald-50 dark:bg-emerald-950/30'
        case 2: return 'bg-primary/10'
        default: return 'bg-white'
      }
    }

    return (
      <div className="overflow-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-muted">Esfera / Cilindro</th>
              {cylinderValues.map((cyl, idx) => (
                <th key={idx} className="border p-2 bg-muted text-xs">
                  {cyl.toFixed(2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sphereValues.map((sphere, rowIdx) => (
              <tr key={rowIdx}>
                <td className="border p-2 bg-muted font-medium text-xs">
                  {sphere > 0 ? '+' : ''}{sphere.toFixed(2)}
                </td>
                {matrix[rowIdx]?.map((value: number, colIdx: number) => (
                  <td
                    key={colIdx}
                    className={`border p-1 text-center ${getCellColor(value)}`}
                    title={legend[value]}
                  >
                    <span className="text-xs">{value}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex gap-4">
          {Object.entries(legend).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-4 h-4 border ${
                key === '0' ? 'bg-muted' :
                key === '1' ? 'bg-emerald-50 dark:bg-emerald-950/30' :
                'bg-primary/10'
              }`}></div>
              <span className="text-sm">{value as string}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Especificaciones Técnicas</h1>
            <p className="text-muted-foreground">
              Información técnica detallada de productos y tratamientos
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">
              <FileText className="mr-2 h-4 w-4" />
              Vista General
            </TabsTrigger>
            <TabsTrigger value="grid">
              <Grid3x3 className="mr-2 h-4 w-4" />
              Tabla de Graduaciones
            </TabsTrigger>
            <TabsTrigger value="treatments">
              <Table className="mr-2 h-4 w-4" />
              Tratamientos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Especificaciones por Tipo de Lente</CardTitle>
                <CardDescription>
                  Comparativa de características técnicas entre diferentes líneas de productos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Característica</th>
                        <th className="text-left p-4">LENTES DE STOCK</th>
                        <th className="text-left p-4">LENTES DE LABORATORIO</th>
                        <th className="text-left p-4">CLEARVIEW DuraVision</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Materiales Disponibles</td>
                        <td className="p-4">1.56, 1.61</td>
                        <td className="p-4">1.56, 1.61, 1.67, 1.74</td>
                        <td className="p-4">1.60</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Rango Esférico</td>
                        <td className="p-4">-8.00 a +6.00</td>
                        <td className="p-4">-20.00 a +20.00</td>
                        <td className="p-4">-10.00 a +8.00</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Rango Cilíndrico</td>
                        <td className="p-4">Hasta -4.00</td>
                        <td className="p-4">Hasta -6.00</td>
                        <td className="p-4">Hasta -4.00</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Diámetros</td>
                        <td className="p-4">65mm, 70mm, 75mm</td>
                        <td className="p-4">65mm a 80mm</td>
                        <td className="p-4">70mm, 75mm</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Tiempo de Entrega</td>
                        <td className="p-4">
                          <Badge variant="secondary">Inmediato</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">3-5 días hábiles</Badge>
                        </td>
                        <td className="p-4">
                          <Badge>24-48 horas</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Garantías</CardTitle>
                <CardDescription>
                  Períodos de garantía por tipo de producto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Lentes de Stock</h3>
                    <p className="text-sm text-muted-foreground">Estándar: 6 meses</p>
                    <p className="text-sm text-muted-foreground">Extendida: 12 meses</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Lentes de Laboratorio</h3>
                    <p className="text-sm text-muted-foreground">Estándar: 12 meses</p>
                    <p className="text-sm text-muted-foreground">Extendida: 24 meses</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">ClearView DuraVision</h3>
                    <p className="text-sm text-muted-foreground">Estándar: 24 meses</p>
                    <p className="text-sm text-muted-foreground">Extendida: 36 meses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certificaciones</CardTitle>
                <CardDescription>
                  Certificaciones de calidad y cumplimiento normativo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">ISO 9001:2015</Badge>
                    <span className="text-sm">Sistema de Gestión de Calidad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">ISO 14001:2015</Badge>
                    <span className="text-sm">Gestión Ambiental</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">CE Mark</Badge>
                    <span className="text-sm">Conformidad Europea</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">FDA Approved</Badge>
                    <span className="text-sm">Aprobación FDA para exportación</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grid" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{gridData?.title || 'Cobertura de Graduaciones'}</CardTitle>
                <CardDescription>
                  Matriz de disponibilidad por esfera y cilindro
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderGrid()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="treatments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tratamientos Antirreflejante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Básico</h3>
                    <p className="text-sm text-muted-foreground">Reducción de reflejos 99.5%</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Premium</h3>
                    <p className="text-sm text-muted-foreground">DuraVision Platinum con capa hidrofóbica</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Blue Protect</h3>
                    <p className="text-sm text-muted-foreground">Filtro luz azul 420nm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tratamientos Fotocromáticos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Transitions Gen 8</h3>
                    <p className="text-sm text-muted-foreground">Activación en 30 segundos</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Transitions XTRActive</h3>
                    <p className="text-sm text-muted-foreground">Activación en interiores y auto</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">PhotoFusion X</h3>
                    <p className="text-sm text-muted-foreground">Tecnología Zeiss</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Protección UV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold">UV 380</h3>
                    <p className="text-sm text-muted-foreground">Protección estándar</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">UV 400</h3>
                    <p className="text-sm text-muted-foreground">Protección completa</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">UV 420</h3>
                    <p className="text-sm text-muted-foreground">Protección + luz azul</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}