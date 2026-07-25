import { useState } from 'react'
import {
  Code,
  Smartphone,
  QrCode,
  Globe,
  Key,
  Copy,
  Check,
  Send,
  Loader2,
  Terminal,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import apiClient from '@/lib/api-client'
import { toast } from 'sonner'

interface ApiEndpoint {
  id: string
  title: string
  category: 'mobile' | 'scanner' | 'third_party' | 'external'
  method: 'GET' | 'POST'
  path: string
  description: string
  sampleCurl: string
  sampleBody?: string
}

const ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'mobile-sync',
    title: 'Mobile App Sync Payload',
    category: 'mobile',
    method: 'GET',
    path: '/api/v1/external/mobile/sync',
    description: 'Fetch complete products, categories, warehouses, and customer catalog for offline mobile POS sync.',
    sampleCurl: `curl -X GET "http://localhost:5000/api/v1/external/mobile/sync" \\\n  -H "X-API-Key: sk_live_demo_key_12345"`,
  },
  {
    id: 'mobile-sale',
    title: 'Mobile App POS Sale Submit',
    category: 'mobile',
    method: 'POST',
    path: '/api/v1/external/mobile/sales',
    description: 'Post completed sale orders directly from Mobile POS application.',
    sampleCurl: `curl -X POST "http://localhost:5000/api/v1/external/mobile/sales" \\\n  -H "X-API-Key: sk_live_demo_key_12345" \\\n  -H "Content-Type: application/json" \\\n  -d '{"items":[{"productId":"prod-id-123","quantity":2,"unitPrice":29.99}],"paymentMethod":"cash"}'`,
    sampleBody: JSON.stringify(
      {
        items: [{ productId: 'prod-id-123', quantity: 2, unitPrice: 29.99 }],
        paymentMethod: 'cash',
      },
      null,
      2
    ),
  },
  {
    id: 'scanner-lookup',
    title: 'Barcode Scanner Scan Lookup',
    category: 'scanner',
    method: 'GET',
    path: '/api/v1/external/scanner/scan/:barcode',
    description: 'Instant product details and warehouse stock lookup by barcode, SKU, or QR code string.',
    sampleCurl: `curl -X GET "http://localhost:5000/api/v1/external/scanner/scan/WMS-001" \\\n  -H "X-API-Key: sk_live_demo_key_12345"`,
  },
  {
    id: 'scanner-adjust',
    title: 'Barcode Scanner Stock Adjustment',
    category: 'scanner',
    method: 'POST',
    path: '/api/v1/external/scanner/adjust-stock',
    description: 'Perform instant stock audit adjustment (increase/decrease) via handheld barcode scanner.',
    sampleCurl: `curl -X POST "http://localhost:5000/api/v1/external/scanner/adjust-stock" \\\n  -H "X-API-Key: sk_live_demo_key_12345" \\\n  -H "Content-Type: application/json" \\\n  -d '{"barcode":"WMS-001","warehouseId":"wh-main","quantity":5,"action":"increase"}'`,
    sampleBody: JSON.stringify(
      {
        barcode: 'WMS-001',
        warehouseId: 'wh-main',
        quantity: 5,
        action: 'increase',
      },
      null,
      2
    ),
  },
  {
    id: 'tp-catalog',
    title: 'Products Catalog Export',
    category: 'third_party',
    method: 'GET',
    path: '/api/v1/external/products',
    description: 'Fetch paginated product catalog for e-commerce website or ERP sync.',
    sampleCurl: `curl -X GET "http://localhost:5000/api/v1/external/products?limit=20&page=1" \\\n  -H "X-API-Key: sk_live_demo_key_12345"`,
  },
  {
    id: 'tp-inventory',
    title: 'Real-Time Inventory Levels',
    category: 'third_party',
    method: 'GET',
    path: '/api/v1/external/inventory',
    description: 'Query real-time stock levels per warehouse for external marketplaces.',
    sampleCurl: `curl -X GET "http://localhost:5000/api/v1/external/inventory" \\\n  -H "X-API-Key: sk_live_demo_key_12345"`,
  },
  {
    id: 'ext-webhook',
    title: 'External Systems Webhook Ingestion',
    category: 'external',
    method: 'POST',
    path: '/api/v1/external/webhooks',
    description: 'Receive event callbacks and data payloads from external partner systems.',
    sampleCurl: `curl -X POST "http://localhost:5000/api/v1/external/webhooks" \\\n  -H "X-API-Key: sk_live_demo_key_12345" \\\n  -H "Content-Type: application/json" \\\n  -d '{"event":"ORDER_CREATED","data":{"orderId":"EXT-9001"}}'`,
    sampleBody: JSON.stringify(
      { event: 'ORDER_CREATED', data: { orderId: 'EXT-9001' } },
      null,
      2
    ),
  },
]

export function ApiDocsPage() {
  const [apiKey, setApiKey] = useState('sk_live_demo_key_12345')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Tester state
  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<Record<string, any>>({})

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('cURL command copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleTestApi = async (endpoint: ApiEndpoint) => {
    setTestingEndpointId(endpoint.id)
    try {
      let res: any
      const path = endpoint.path.replace(':barcode', 'WMS-001')

      if (endpoint.method === 'GET') {
        res = await apiClient.get(path, {
          headers: { 'X-API-Key': apiKey },
        })
      } else {
        const body = endpoint.sampleBody ? JSON.parse(endpoint.sampleBody) : {}
        res = await apiClient.post(path, body, {
          headers: { 'X-API-Key': apiKey },
        })
      }

      setTestResult((prev) => ({ ...prev, [endpoint.id]: res }))
      toast.success(`Request succeeded for ${endpoint.title}`)
    } catch (err: any) {
      setTestResult((prev) => ({
        ...prev,
        [endpoint.id]: err.response?.data || { error: err.message },
      }))
      toast.error(`Request failed for ${endpoint.title}`)
    } finally {
      setTestingEndpointId(null)
    }
  }

  const categories = [
    { id: 'all', label: 'All Endpoints' },
    { id: 'mobile', label: 'Mobile Apps' },
    { id: 'scanner', label: 'Barcode Scanners' },
    { id: 'third_party', label: 'Third-Party ERP' },
    { id: 'external', label: 'External Systems' },
  ]

  const filteredEndpoints = ENDPOINTS.filter(
    (e) => activeCategory === 'all' || e.category === activeCategory
  )

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
          <Terminal className="h-7 w-7 text-emerald-500" />
          REST API Developer Portal & Docs
        </h1>
        <p className="text-sm text-muted-foreground">
          Secure integration REST APIs for Mobile Apps, Handheld Barcode Scanners, Third-Party ERPs, and External Systems.
        </p>
      </div>

      {/* Authentication Banner */}
      <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Key className="h-6 w-6 text-emerald-500 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">API Key Authentication</h4>
              <p className="text-xs text-muted-foreground">
                Pass your API key in requests using header: <code className="bg-background px-1.5 py-0.5 rounded font-mono font-semibold border text-xs">X-API-Key: {apiKey}</code>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_live_..."
              className="h-9 font-mono text-xs w-full md:w-64 bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Endpoints List */}
      <div className="space-y-6">
        {filteredEndpoints.map((endpoint) => (
          <Card key={endpoint.id} className="shadow-sm border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'} className="font-mono font-bold text-xs">
                    {endpoint.method}
                  </Badge>
                  <CardTitle className="text-base font-semibold">{endpoint.title}</CardTitle>
                </div>
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded border">
                  {endpoint.path}
                </code>
              </div>
              <CardDescription className="text-xs mt-1">
                {endpoint.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* cURL Code Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>cURL Command Sample:</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(endpoint.id, endpoint.sampleCurl)}
                    className="h-7 text-[11px] gap-1"
                  >
                    {copiedId === endpoint.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copiedId === endpoint.id ? 'Copied' : 'Copy cURL'}
                  </Button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed border">
                  {endpoint.sampleCurl}
                </pre>
              </div>

              {/* Live Test Trigger Button */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestApi(endpoint)}
                  disabled={testingEndpointId === endpoint.id}
                  className="gap-1.5 text-xs h-8"
                >
                  {testingEndpointId === endpoint.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Test Endpoint Live</span>
                </Button>
              </div>

              {/* Live Test Output JSON */}
              {testResult[endpoint.id] && (
                <div className="space-y-1 pt-2">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                    Live Response Output (200 OK):
                  </span>
                  <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] max-h-56 overflow-y-auto border">
                    {JSON.stringify(testResult[endpoint.id], null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
