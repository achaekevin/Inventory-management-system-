import prisma from '../../config/database';

export interface LocalizationConfig {
  language: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  dateFormat: string;
  taxMode: 'inclusive' | 'exclusive';
  taxRate: number;
  taxName: string;
  exchangeRates: Record<string, number>;
  taxRules: Array<{
    id: string;
    name: string;
    rate: number;
    mode: 'inclusive' | 'exclusive';
    isDefault?: boolean;
  }>;
}

const DEFAULT_CONFIG: LocalizationConfig = {
  language: 'en',
  currency: 'USD',
  currencySymbol: '$',
  timezone: 'UTC',
  dateFormat: 'MMM dd, yyyy',
  taxMode: 'exclusive',
  taxRate: 16,
  taxName: 'VAT',
  exchangeRates: {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    KES: 130.0,
    JPY: 155.0,
    CAD: 1.36,
    AUD: 1.52,
    INR: 83.5,
    AED: 3.67,
  },
  taxRules: [
    { id: 'vat_std', name: 'Standard VAT (16%)', rate: 16, mode: 'exclusive', isDefault: true },
    { id: 'sales_tax', name: 'State Sales Tax (8.5%)', rate: 8.5, mode: 'exclusive' },
    { id: 'vat_reduced', name: 'Reduced VAT (5%)', rate: 5, mode: 'exclusive' },
    { id: 'tax_exempt', name: 'Tax Exempt (0%)', rate: 0, mode: 'exclusive' },
  ],
};

export class LocalizationService {
  /**
   * Fetch current system localization settings
   */
  async getSettings(): Promise<LocalizationConfig> {
    const settingsList = await prisma.setting.findMany({
      where: { group: 'localization' },
    });

    if (settingsList.length === 0) {
      return DEFAULT_CONFIG;
    }

    const config: any = { ...DEFAULT_CONFIG };

    for (const item of settingsList) {
      const fieldKey = item.key.replace('localization.', '');
      if (item.type === 'json') {
        try {
          config[fieldKey] = JSON.parse(item.value);
        } catch {
          // fallback to default
        }
      } else if (item.type === 'number') {
        config[fieldKey] = Number(item.value);
      } else {
        config[fieldKey] = item.value;
      }
    }

    return config as LocalizationConfig;
  }

  /**
   * Save or update localization settings
   */
  async updateSettings(data: Partial<LocalizationConfig>): Promise<LocalizationConfig> {
    const entries = Object.entries(data);

    for (const [key, value] of entries) {
      const settingKey = `localization.${key}`;
      let settingType = 'string';
      let settingValue = String(value);

      if (typeof value === 'object' && value !== null) {
        settingType = 'json';
        settingValue = JSON.stringify(value);
      } else if (typeof value === 'number') {
        settingType = 'number';
        settingValue = String(value);
      }

      await prisma.setting.upsert({
        where: { key: settingKey },
        update: {
          value: settingValue,
          type: settingType,
          group: 'localization',
        },
        create: {
          key: settingKey,
          value: settingValue,
          type: settingType,
          group: 'localization',
          isPublic: true,
        },
      });
    }

    return this.getSettings();
  }

  /**
   * Currency conversion helper
   */
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<{
    amount: number;
    convertedAmount: number;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
  }> {
    const config = await this.getSettings();
    const rates = config.exchangeRates || DEFAULT_CONFIG.exchangeRates;

    const fromRate = rates[fromCurrency.toUpperCase()] || 1.0;
    const toRate = rates[toCurrency.toUpperCase()] || 1.0;

    // Convert from source currency to USD base, then to target currency
    const amountInUSD = amount / fromRate;
    const convertedAmount = amountInUSD * toRate;
    const rate = toRate / fromRate;

    return {
      amount,
      convertedAmount: Number(convertedAmount.toFixed(2)),
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      rate: Number(rate.toFixed(4)),
    };
  }

  /**
   * Tax calculation helper
   */
  calculateTax(subtotal: number, taxRate: number, mode: 'inclusive' | 'exclusive' = 'exclusive'): {
    subtotal: number;
    taxAmount: number;
    total: number;
    taxRate: number;
    mode: 'inclusive' | 'exclusive';
  } {
    const rateDecimal = taxRate / 100;
    let taxAmount = 0;
    let total = subtotal;

    if (mode === 'inclusive') {
      // Tax is included inside the subtotal
      taxAmount = subtotal - subtotal / (1 + rateDecimal);
      total = subtotal;
    } else {
      // Tax is added on top of the subtotal
      taxAmount = subtotal * rateDecimal;
      total = subtotal + taxAmount;
    }

    return {
      subtotal: Number(subtotal.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      total: Number(total.toFixed(2)),
      taxRate,
      mode,
    };
  }
}

export default new LocalizationService();
