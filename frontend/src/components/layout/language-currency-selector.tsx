import { Globe, Coins } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useLocalization } from '@/contexts/localization-context'
import { SupportedLanguage } from '@/features/localization/i18n'

const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'sw', label: 'Kiswahili', flag: '🇰🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
]

const CURRENCIES = [
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling (KES)' },
  { code: 'USD', symbol: 'USD', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AUD', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
]

export function LanguageCurrencySelector() {
  const { language, setLanguage, currency, setCurrency } = useLocalization()

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 gap-1.5 px-2.5 text-xs font-medium">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="hidden sm:inline-block">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
          <span className="text-muted-foreground">|</span>
          <span className="font-semibold">{currency}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">Language & Regional Preferences</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Submenu for Language */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-xs">
            <Globe className="mr-2 h-4 w-4" />
            <span>Language: <strong className="ml-1">{currentLang.label}</strong></span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-44">
              <DropdownMenuRadioGroup
                value={language}
                onValueChange={(val) => setLanguage(val as SupportedLanguage)}
              >
                {LANGUAGES.map((l) => (
                  <DropdownMenuRadioItem key={l.code} value={l.code} className="text-xs gap-2">
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* Submenu for Currency */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-xs">
            <Coins className="mr-2 h-4 w-4" />
            <span>Currency: <strong className="ml-1">{currency}</strong></span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-48 max-h-[300px] overflow-y-auto">
              <DropdownMenuRadioGroup value={currency} onValueChange={(val) => setCurrency(val)}>
                {CURRENCIES.map((c) => (
                  <DropdownMenuRadioItem key={c.code} value={c.code} className="text-xs justify-between">
                    <span>{c.name}</span>
                    <span className="font-semibold text-muted-foreground">{c.symbol}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
