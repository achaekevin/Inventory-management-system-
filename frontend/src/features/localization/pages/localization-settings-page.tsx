import { useState } from 'react'
import {
  Globe,
  Coins,
  Clock,
  Calendar,
  Receipt,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Percent,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLocalization } from '@/contexts/localization-context'
import { SupportedLanguage } from '@/features/localization/i18n'
import { toast } from 'sonner'

const LANGUAGES: { code: SupportedLanguage; name: string; flag: string }[] = [
  { code: 'en', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'sw', name: 'Kiswahili (Swahili)', flag: '🇰🇪' },
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
]

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada) (UTC-5)' },
  { value: 'Europe/London', label: 'London, Edinburgh, Dublin (UTC+0/+1)' },
  { value: 'Africa/Nairobi', label: 'Nairobi, East Africa (UTC+3)' },
  { value: 'Asia/Dubai', label: 'Dubai, Abu Dhabi (UTC+4)' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Seoul, Osaka (UTC+9)' },
]

const DATE_FORMATS = [
  { value: 'MMM dd, yyyy', label: 'Jul 25, 2026 (Default Standard)' },
  { value: 'yyyy-MM-dd', label: '2026-07-25 (ISO Format)' },
  { value: 'dd/MM/yyyy', label: '25/07/2026 (UK / EU Format)' },
  { value: 'MM/dd/yyyy', label: '07/25/2026 (US Format)' },
  { value: 'dd MMM yyyy', label: '25 Jul 2026 (Extended Format)' },
]

export function LocalizationSettingsPage() {
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    timezone,
    setTimezone,
    dateFormat,
    setDateFormat,
    taxMode,
    setTaxMode,
    taxRate,
    setTaxRate,
    taxName,
    exchangeRates,
    saveSettings,
    t,
  } = useLocalization()

  const [localTaxName, setLocalTaxName] = useState(taxName)
  const [localTaxRate, setLocalTaxRate] = useState(taxRate)
  const [localTaxMode, setLocalTaxMode] = useState(taxMode)
  const [rates, setRates] = useState<Record<string, number>>({ ...exchangeRates })
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      await saveSettings({
        language,
        currency,
        timezone,
        dateFormat,
        taxMode: localTaxMode,
        taxRate: Number(localTaxRate),
        taxName: localTaxName,
        exchangeRates: rates,
      })
      toast.success('Localization settings saved successfully!')
    } catch {
      toast.error('Failed to save localization settings.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRateChange = (code: string, val: string) => {
    const num = Number(val) || 0
    setRates((prev) => ({ ...prev, [code]: num }))
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t('localization.title', 'Localization & Regional Settings')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t(
            'localization.subtitle',
            'Manage multi-language translation, currencies, timezones, date formats, and tax rules.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language & Regional Settings */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Language & Regional Format
            </CardTitle>
            <CardDescription className="text-xs">
              Select primary UI display language, time zone, and date presentation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {/* System Language */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">System Language</Label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Timezone */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                System Time Zone
              </Label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Format */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Date Format
              </Label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
              >
                {DATE_FORMATS.map((df) => (
                  <option key={df.value} value={df.value}>
                    {df.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Currency & Tax Mode */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-500" />
              Currency & Tax Calculation Rules
            </CardTitle>
            <CardDescription className="text-xs">
              Configure default base currency, tax rate percentage, and tax application mode.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {/* Default Base Currency */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Default System Currency</Label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring font-medium"
              >
                <option value="KES">KES (KSh) - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>

            {/* Tax Name & Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Tax Name</Label>
                <Input
                  value={localTaxName}
                  onChange={(e) => setLocalTaxName(e.target.value)}
                  placeholder="e.g. VAT, Sales Tax"
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Default Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={localTaxRate}
                  onChange={(e) => setLocalTaxRate(Number(e.target.value))}
                  placeholder="16"
                  className="h-10"
                />
              </div>
            </div>

            {/* Tax Mode Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                Tax Application Mode
              </Label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setLocalTaxMode('exclusive')}
                  className={`p-3 rounded-lg border text-left transition-all text-xs ${
                    localTaxMode === 'exclusive'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-muted hover:bg-muted/50'
                  }`}
                >
                  <div className="font-medium">Exclusive (Added)</div>
                  <div className="text-[11px] text-muted-foreground font-normal mt-0.5">
                    Tax added on top of item subtotal at checkout
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLocalTaxMode('inclusive')}
                  className={`p-3 rounded-lg border text-left transition-all text-xs ${
                    localTaxMode === 'inclusive'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-muted hover:bg-muted/50'
                  }`}
                >
                  <div className="font-medium">Inclusive (Included)</div>
                  <div className="text-[11px] text-muted-foreground font-normal mt-0.5">
                    Product listed prices already include tax
                  </div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exchange Rates Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-purple-500" />
            Multi-Currency Exchange Rates (Base: USD)
          </CardTitle>
          <CardDescription className="text-xs">
            Manage exchange rates for instant multi-currency price conversions across invoices and sales POS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(rates).map(([code, rate]) => (
              <div key={code} className="flex items-center justify-between border rounded-lg p-3 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {code}
                  </Badge>
                  <span className="text-xs text-muted-foreground">1 USD =</span>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => handleRateChange(code, e.target.value)}
                  className="w-24 h-8 text-right font-mono text-xs"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button Bar */}
      <div className="flex justify-end border-t pt-4">
        <Button onClick={handleSaveAll} size="lg" disabled={isSaving} className="gap-2 px-6">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  )
}
