import { useState } from 'react'
import { Download, FileText, BarChart3, TrendingUp, Package, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ReportsPage() {
  const [reportType, setReportType] = useState('sales')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [format, setFormat] = useState('pdf')

  const reports = [
    {
      id: 'sales',
      name: 'Sales Report',
      description: 'Detailed sales transactions and revenue analysis',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      id: 'inventory',
      name: 'Inventory Report',
      description: 'Stock levels, movements, and valuations',
      icon: Package,
      color: 'text-blue-600',
    },
    {
      id: 'purchases',
      name: 'Purchase Report',
      description: 'Supplier purchase orders and expenses',
      icon: FileText,
      color: 'text-purple-600',
    },
    {
      id: 'customers',
      name: 'Customer Report',
      description: 'Customer analytics and purchase history',
      icon: Users,
      color: 'text-orange-600',
    },
    {
      id: 'profit',
      name: 'Profit & Loss',
      description: 'Revenue, costs, and profit margins',
      icon: BarChart3,
      color: 'text-red-600',
    },
  ]

  const handleGenerateReport = () => {
    // Implement report generation logic
    alert(`Generating ${reportType} report from ${startDate} to ${endDate} in ${format} format`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate and export business reports</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <Card
              key={report.id}
              className={`cursor-pointer transition-colors ${
                reportType === report.id ? 'border-primary' : ''
              }`}
              onClick={() => setReportType(report.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${report.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{report.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerateReport} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Generate & Download Report
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
