// Shipping Calculator for India
export interface ShippingSettings {
  baseRate: number; // Base rate per kg
  freeShippingThreshold: number; // Free shipping above this amount
  weightMultipliers: {
    [key: string]: number; // Different rates for different product types
  };
  zones: {
    local: { rate: number; description: string }; // Same city
    regional: { rate: number; description: string }; // Same state
    national: { rate: number; description: string }; // Other states
  };
}

export interface GSTSettings {
  rate: number; // GST percentage (default 18%)
  hsn: {
    [key: string]: string; // HSN codes for different products
  };
}

export class ShippingCalculator {
  private static readonly SHIPPING_SETTINGS_KEY = 'shipping_settings';
  private static readonly GST_SETTINGS_KEY = 'gst_settings';

  // Default shipping settings
  private static defaultShippingSettings: ShippingSettings = {
    baseRate: 50, // Rs. 50 per kg
    freeShippingThreshold: 5000, // Free shipping above Rs. 5000
    weightMultipliers: {
      'box': 1.2, // Boxes are bulky
      'brochure': 0.8, // Brochures are light
      'digital-print': 0.6, // Digital prints are very light
      'paper-bag': 1.0, // Standard weight
    },
    zones: {
      local: { rate: 0.8, description: 'Same City' },
      regional: { rate: 1.0, description: 'Same State' },
      national: { rate: 1.5, description: 'Other States' },
    }
  };

  // Default GST settings
  private static defaultGSTSettings: GSTSettings = {
    rate: 18, // 18% GST
    hsn: {
      'box': '4819', // Paper packaging
      'brochure': '4911', // Printed matter
      'digital-print': '4911', // Printed matter
      'paper-bag': '4819', // Paper packaging
    }
  };

  // Get shipping settings
  static getShippingSettings(): ShippingSettings {
    try {
      const settings = localStorage.getItem(this.SHIPPING_SETTINGS_KEY);
      return settings ? JSON.parse(settings) : this.defaultShippingSettings;
    } catch (error) {
      console.error('Error reading shipping settings:', error);
      return this.defaultShippingSettings;
    }
  }

  // Save shipping settings
  static saveShippingSettings(settings: ShippingSettings): void {
    localStorage.setItem(this.SHIPPING_SETTINGS_KEY, JSON.stringify(settings));
  }

  // Get GST settings
  static getGSTSettings(): GSTSettings {
    try {
      const settings = localStorage.getItem(this.GST_SETTINGS_KEY);
      return settings ? JSON.parse(settings) : this.defaultGSTSettings;
    } catch (error) {
      console.error('Error reading GST settings:', error);
      return this.defaultGSTSettings;
    }
  }

  // Save GST settings
  static saveGSTSettings(settings: GSTSettings): void {
    localStorage.setItem(this.GST_SETTINGS_KEY, JSON.stringify(settings));
  }

  // Calculate estimated weight based on product type and specifications
  static calculateWeight(
    productType: 'box' | 'brochure' | 'digital-print' | 'paper-bag',
    specifications: any
  ): number {
    switch (productType) {
      case 'box':
        // Weight = (L × W × H × quantity × board thickness factor) / 1000
        const { length = 12, width = 8, height = 3, quantity = 300, boardThickness = '2.4mm' } = specifications;
        const thicknessFactor = parseFloat(boardThickness.replace('mm', '')) * 0.1;
        return Math.max(0.5, (length * width * height * quantity * thicknessFactor) / 10000);

      case 'brochure':
        // Weight = (pages × quantity × paper GSM) / 10000
        const { pages = 4, quantity: brochureQty = 1000, paperGSM = '170' } = specifications;
        const gsm = parseInt(paperGSM.replace('gsm', ''));
        return Math.max(0.2, (pages * brochureQty * gsm) / 50000);

      case 'digital-print':
        // Weight = (width × height × quantity × paper weight) / 10000
        const { width: cardWidth = 3.5, height: cardHeight = 2, quantity: cardQty = 500, paperType = '350 matt' } = specifications;
        const paperWeight = parseInt(paperType.split(' ')[0]) || 350;
        return Math.max(0.1, (cardWidth * cardHeight * cardQty * paperWeight) / 100000);

      case 'paper-bag':
        // Weight = (size factor × quantity × paper GSM) / 1000
        const { size = 'medium', quantity: bagQty = 500, paperGSM: bagGSM = '120' } = specifications;
        const sizeFactor = size === 'small' ? 0.5 : size === 'medium' ? 1.0 : 1.5;
        const bagGSMValue = parseInt(bagGSM.toString()) || 120;
        return Math.max(0.3, (sizeFactor * bagQty * bagGSMValue) / 5000);

      default:
        return 1.0; // Default 1kg
    }
  }

  // Calculate shipping charges
  static calculateShippingCharges(
    productType: 'box' | 'brochure' | 'digital-print' | 'paper-bag',
    specifications: any,
    zone: 'local' | 'regional' | 'national' = 'national',
    baseAmount: number
  ): { weight: number; charges: number; isFree: boolean } {
    const settings = this.getShippingSettings();
    
    // Check for free shipping
    if (baseAmount >= settings.freeShippingThreshold) {
      return {
        weight: this.calculateWeight(productType, specifications),
        charges: 0,
        isFree: true
      };
    }

    const weight = this.calculateWeight(productType, specifications);
    const weightMultiplier = settings.weightMultipliers[productType] || 1.0;
    const zoneMultiplier = settings.zones[zone].rate;
    
    const charges = Math.ceil(weight * weightMultiplier * settings.baseRate * zoneMultiplier);
    
    return {
      weight: Math.round(weight * 100) / 100, // Round to 2 decimal places
      charges,
      isFree: false
    };
  }

  // Calculate GST
  static calculateGST(baseAmount: number, productType?: string): { gstAmount: number; gstRate: number; hsnCode: string } {
    const settings = this.getGSTSettings();
    const gstAmount = Math.round((baseAmount * settings.rate) / 100);
    const hsnCode = productType ? settings.hsn[productType] || '4911' : '4911';
    
    return {
      gstAmount,
      gstRate: settings.rate,
      hsnCode
    };
  }

  // Calculate total with GST and shipping
  static calculateTotal(
    baseAmount: number,
    productType: 'box' | 'brochure' | 'digital-print' | 'paper-bag',
    specifications: any,
    zone: 'local' | 'regional' | 'national' = 'national'
  ) {
    const shipping = this.calculateShippingCharges(productType, specifications, zone, baseAmount);
    const gst = this.calculateGST(baseAmount, productType);
    
    const totalAmount = baseAmount + gst.gstAmount + shipping.charges;
    
    return {
      baseAmount,
      gstAmount: gst.gstAmount,
      gstRate: gst.gstRate,
      hsnCode: gst.hsnCode,
      shippingCharges: shipping.charges,
      shippingWeight: shipping.weight,
      shippingZone: zone,
      isFreeShipping: shipping.isFree,
      totalAmount,
      breakdown: {
        subtotal: baseAmount,
        gst: gst.gstAmount,
        shipping: shipping.charges,
        total: totalAmount
      }
    };
  }

  // Reset to default settings
  static resetToDefaults(): void {
    this.saveShippingSettings(this.defaultShippingSettings);
    this.saveGSTSettings(this.defaultGSTSettings);
  }
}
