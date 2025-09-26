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
              <th className="border p-2 bg-muted">Sphere / Cylinder</th>
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
              Overview
            </TabsTrigger>
            <TabsTrigger value="grid">
              <Grid3x3 className="mr-2 h-4 w-4" />
              Prescription Grid
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
                        <th className="text-left p-4">Feature</th>
                        <th className="text-left p-4">STOCK LENSES</th>
                        <th className="text-left p-4">LABORATORY LENSES</th>
                        <th className="text-left p-4 bg-primary/5">CLEARVIEW DuraVision</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Materials</td>
                        <td className="p-4">1.56, 1.61</td>
                        <td className="p-4">1.56, 1.61, 1.67, 1.74</td>
                        <td className="p-4 bg-primary/5 font-medium">1.60</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Spherical Range</td>
                        <td className="p-4">-8.00 to +6.00</td>
                        <td className="p-4">-20.00 to +20.00</td>
                        <td className="p-4 bg-primary/5 font-medium">-10.00 to +8.00</td>
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
                <CardTitle>Certifications</CardTitle>
                <CardDescription>
                  Quality certifications applicable to CLEARVIEW products
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
                      Advanced protection against harmful blue light (380-455 nm) emitted by digital screens.
                      Reduces eye strain and improves contrast while maintaining optimal light transmission.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">DuraVision Platinum</h3>
                    <p className="text-sm text-muted-foreground">
                      Premium anti-reflective coating with hydrophobic and oleophobic properties.
                      Facilitates cleaning and keeps lenses free from fingerprints and smudges.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Antistatic Layer</h3>
                    <p className="text-sm text-muted-foreground">
                      Prevents dust and particle accumulation on the lens surface,
                      maintaining clear vision for longer.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Material 1.60 Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-1">Optical Advantages</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Optimal refractive index</li>
                      <li>• Thinner than 1.50</li>
                      <li>• Excellent visual clarity</li>
                      <li>• Balanced Abbe number</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Physical Advantages</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 30% thinner and lighter</li>
                      <li>• Impact resistant</li>
                      <li>• Compatible with rimless frames</li>
                      <li>• 100% UV protection</li>
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