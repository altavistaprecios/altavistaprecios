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
            <h1 className="text-3xl font-bold tracking-tight">Technical Specifications</h1>
            <p className="text-muted-foreground">
              Detailed technical information for products and treatments
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">
              <FileText className="mr-2 h-4 w-4" />
              General View
            </TabsTrigger>
            <TabsTrigger value="grid">
              <Grid3x3 className="mr-2 h-4 w-4" />
              Prescription Table
            </TabsTrigger>
            <TabsTrigger value="treatments">
              <Table className="mr-2 h-4 w-4" />
              Treatments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Specifications by Lens Type</CardTitle>
                <CardDescription>
                  Technical features comparison between different product lines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Feature</th>
                        <th className="text-left p-4">STOCK LENSES</th>
                        <th className="text-left p-4">LABORATORY LENSES</th>
                        <th className="text-left p-4">CLEARVIEW DuraVision</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Available Materials</td>
                        <td className="p-4">1.56, 1.61</td>
                        <td className="p-4">1.56, 1.61, 1.67, 1.74</td>
                        <td className="p-4">1.60</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Spherical Range</td>
                        <td className="p-4">-8.00 a +6.00</td>
                        <td className="p-4">-20.00 a +20.00</td>
                        <td className="p-4">-10.00 a +8.00</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Cylindrical Range</td>
                        <td className="p-4">Up to -4.00</td>
                        <td className="p-4">Up to -6.00</td>
                        <td className="p-4">Up to -4.00</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Diameters</td>
                        <td className="p-4">65mm, 70mm, 75mm</td>
                        <td className="p-4">65mm to 80mm</td>
                        <td className="p-4">70mm, 75mm</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Delivery Time</td>
                        <td className="p-4">
                          <Badge variant="secondary">Immediate</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">3-5 business days</Badge>
                        </td>
                        <td className="p-4">
                          <Badge>24-48 hours</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Warranties</CardTitle>
                <CardDescription>
                  Warranty periods by product type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Stock Lenses</h3>
                    <p className="text-sm text-muted-foreground">Standard: 6 months</p>
                    <p className="text-sm text-muted-foreground">Extended: 12 months</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Laboratory Lenses</h3>
                    <p className="text-sm text-muted-foreground">Standard: 12 months</p>
                    <p className="text-sm text-muted-foreground">Extended: 24 months</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">ClearView DuraVision</h3>
                    <p className="text-sm text-muted-foreground">Standard: 24 months</p>
                    <p className="text-sm text-muted-foreground">Extended: 36 months</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
                <CardDescription>
                  Quality certifications and regulatory compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">ISO 9001:2015</Badge>
                    <span className="text-sm">Quality Management System</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">ISO 14001:2015</Badge>
                    <span className="text-sm">Environmental Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">CE Mark</Badge>
                    <span className="text-sm">European Conformity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">FDA Approved</Badge>
                    <span className="text-sm">FDA Approval for export</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grid" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{gridData?.title || 'Prescription Coverage'}</CardTitle>
                <CardDescription>
                  Availability matrix by sphere and cylinder
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