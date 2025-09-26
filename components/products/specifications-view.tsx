'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Grid3x3, Table } from 'lucide-react'

export function SpecificationsView() {
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
        case 1: return 'bg-primary/10' // Light blue for standard stock
        case 2: return 'bg-primary/30' // Blue for extended range
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
                key === '1' ? 'bg-primary/10' :
                'bg-primary/30'
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
              Treatments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>CLEARVIEW DuraVision Specifications</CardTitle>
                <CardDescription>
                  Technical features of the MONOFOCALES TERMINADOS line
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">1.60 with Blue Guard</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Code:</span> 160VTCV</p>
                        <p><span className="font-medium">Material:</span> 1.60</p>
                        <p><span className="font-medium">Spherical Range:</span> -10.00 to +8.00</p>
                        <p><span className="font-medium">Cylindrical Range:</span> Up to -4.00</p>
                        <p><span className="font-medium">Diameters:</span> 70mm, 75mm</p>
                        <Badge variant="secondary" className="mt-2">Standard stock</Badge>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">1.60 with Blue Guard (Extended Range)</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Code:</span> 160VTCVRX</p>
                        <p><span className="font-medium">Material:</span> 1.60</p>
                        <p><span className="font-medium">Spherical Range:</span> -10.00 to +8.00</p>
                        <p><span className="font-medium">Cylindrical Range:</span> Up to -4.00</p>
                        <p><span className="font-medium">Diameters:</span> 70mm, 75mm</p>
                        <Badge className="mt-2">Extended availability</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparison with other lines</CardTitle>
                <CardDescription>
                  Differences between CLEARVIEW and other product lines
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
                        <th className="text-left p-4 bg-primary/5">CLEARVIEW DuraVision</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Materiales</td>
                        <td className="p-4">1.56, 1.61</td>
                        <td className="p-4">1.56, 1.61, 1.67, 1.74</td>
                        <td className="p-4 bg-primary/5 font-medium">1.60</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Spherical Range</td>
                        <td className="p-4">-8.00 a +6.00</td>
                        <td className="p-4">-20.00 a +20.00</td>
                        <td className="p-4 bg-primary/5 font-medium">-10.00 a +8.00</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Delivery Time</td>
                        <td className="p-4">
                          <Badge variant="secondary">Immediate</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">3-5 business days</Badge>
                        </td>
                        <td className="p-4 bg-primary/5">
                          <Badge>24-48 hours</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Standard Warranty</td>
                        <td className="p-4">6 months</td>
                        <td className="p-4">12 months</td>
                        <td className="p-4 bg-primary/5 font-medium">24 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certificaciones</CardTitle>
                <CardDescription>
                  Certificaciones de calidad aplicables a productos CLEARVIEW
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
                <CardTitle>{gridData?.title || 'CLEARVIEW Prescription Coverage'}</CardTitle>
                <CardDescription>
                  Availability matrix by sphere and cylinder for finished products.
                  Colors indicate: Gray (not available), Light blue (standard stock), Blue (extended availability)
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
                <CardTitle>DuraVision® Treatments</CardTitle>
                <CardDescription>
                  Premium treatments included in CLEARVIEW products
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Blue Guard</h3>
                    <p className="text-sm text-muted-foreground">
                      Protección avanzada contra la luz azul nociva (380-455 nm) emitida por pantallas digitales.
                      Reduce la fatiga visual y mejora el contraste, manteniendo una transmisión de luz óptima.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">DuraVision Platinum</h3>
                    <p className="text-sm text-muted-foreground">
                      Capa antirreflejante premium con propiedades hidrofóbicas y oleofóbicas.
                      Facilita la limpieza y mantiene las lentes libres de huellas y manchas.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Capa Antiestática</h3>
                    <p className="text-sm text-muted-foreground">
                      Previene la acumulación de polvo y partículas en la superficie del lente,
                      manteniendo una visión clara por más tiempo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Características del Material 1.60</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-1">Ventajas Ópticas</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Índice de refracción óptimo</li>
                      <li>• Menor espesor que 1.50</li>
                      <li>• Excelente claridad visual</li>
                      <li>• Número Abbe balanceado</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Ventajas Físicas</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 30% más delgado y liviano</li>
                      <li>• Resistente a impactos</li>
                      <li>• Compatible con monturas al aire</li>
                      <li>• Protección UV 100%</li>
                    </ul>
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