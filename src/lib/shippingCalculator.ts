/**
 * Shipping Calculator for Indian Market
 * Handles GST calculations and shipping charges based on weight and zones
 */

export interface ShippingZone {
  name: string;
  baseRate: number; // per kg
  freeShippingThreshold: number; // minimum order value for free shipping
  deliveryDays: string;
}

export interface ShippingSettings {
  gstRate: number;
  zones: {
    local: ShippingZone;
    regional: ShippingZone;
    national: ShippingZone;
  };
  weightCalculation: {
    [productType: string]: {
      baseWeight: number; // kg per unit
      packagingWeight: number; // additional packaging weight
    };
  };
}

export interface ShippingCalculation {
  baseAmount: number;
  gstAmount: number;
  gstRate: number;
  shippingCharges: number;
  shippingWeight: number;
  totalAmount: number;
  isFreeShipping: boolean;
  deliveryDays: string;
  zone: string;
}

class ShippingCalculatorClass {
  private settings: ShippingSettings;

  constructor() {
    // Load settings from localStorage or use defaults
    this.settings = this.loadSettings();
  }

  private loadSettings(): ShippingSettings {
    const savedSettings = localStorage.getItem('shippingSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }

    // Default settings for Indian market
    return {
      gstRate: 18, // 18% GST for printing services
      zones: {
        local: {
          name: 'Local (Same City)',
          baseRate: 25, // ₹25 per kg
          freeShippingThreshold: 2000, // Free shipping above ₹2000
          deliveryDays: '1-2 Days'
        },
        regional: {
          name: 'Regional (Same State)',
          baseRate: 35, // ₹35 per kg
          freeShippingThreshold: 3000, // Free shipping above ₹3000
          deliveryDays: '2-3 Days'
        },
        national: {
          name: 'National (Other States)',
          baseRate: 50, // ₹50 per kg
          freeShippingThreshold: 5000, // Free shipping above ₹5000
          deliveryDays: '4-7 Days'
        }
      },
      weightCalculation: {
        'box': {
          baseWeight: 0.5, // 500g per box
          packagingWeight: 0.2 // 200g packaging
        },
        'digital-print': {
          baseWeight: 0.001, // 1g per piece (business cards)
          packagingWeight: 0.1 // 100g packaging
        },
        'brochure': {
          baseWeight: 0.05, // 50g per brochure
          packagingWeight: 0.15 // 150g packaging
        },
        'paper-bag': {
          baseWeight: 0.1, // 100g per bag
          packagingWeight: 0.2 // 200g packaging
        }
      }
    };
  }

  public saveSettings(settings: ShippingSettings): void {
    this.settings = settings;
    localStorage.setItem('shippingSettings', JSON.stringify(settings));
  }

  public getSettings(): ShippingSettings {
    return { ...this.settings };
  }

  public calculateWeight(
    productType: string, 
    quantity: number, 
    specifications?: any
  ): number {
    const weightConfig = this.settings.weightCalculation[productType];
    if (!weightConfig) {
      return 1; // Default 1kg if product type not found
    }

    let totalWeight = (quantity * weightConfig.baseWeight) + weightConfig.packagingWeight;

    // Special calculations for different product types
    if (productType === 'box' && specifications) {
      // Box weight depends on dimensions and board thickness
      const { length = 12, width = 8, height = 3, boardThickness = '2.4mm' } = specifications;
      const thicknessMultiplier = parseFloat(boardThickness) / 2.4; // relative to 2.4mm
      const sizeMultiplier = (length * width * height) / (12 * 8 * 3); // relative to standard size
      totalWeight = totalWeight * thicknessMultiplier * sizeMultiplier;
    }

    if (productType === 'digital-print' && specifications) {
      // Weight depends on paper type and dimensions
      const { paperType = '350 matt' } = specifications;
      const gsmMatch = paperType.match(/(\d+)/);
      const gsm = gsmMatch ? parseInt(gsmMatch[1]) : 350;
      const gsmMultiplier = gsm / 350; // relative to 350 GSM
      totalWeight = totalWeight * gsmMultiplier;
    }

    // Minimum weight of 0.1kg
    return Math.max(totalWeight, 0.1);
  }

  public calculateTotal(
    baseAmount: number,
    productType: string,
    specifications: any,
    zone: 'local' | 'regional' | 'national'
  ): ShippingCalculation {
    const zoneConfig = this.settings.zones[zone];
    const weight = this.calculateWeight(productType, specifications.quantity || 1, specifications);
    
    // Calculate GST
    const gstAmount = Math.round((baseAmount * this.settings.gstRate / 100) * 100) / 100;
    
    // Calculate shipping charges
    let shippingCharges = Math.ceil(weight * zoneConfig.baseRate);
    const isFreeShipping = baseAmount >= zoneConfig.freeShippingThreshold;
    
    if (isFreeShipping) {
      shippingCharges = 0;
    }

    const totalAmount = baseAmount + gstAmount + shippingCharges;

    return {
      baseAmount: Math.round(baseAmount * 100) / 100,
      gstAmount,
      gstRate: this.settings.gstRate,
      shippingCharges,
      shippingWeight: Math.round(weight * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      isFreeShipping,
      deliveryDays: zoneConfig.deliveryDays,
      zone: zoneConfig.name
    };
  }

  public getZoneOptions() {
    return [
      { value: 'local', label: `${this.settings.zones.local.name} - ${this.settings.zones.local.deliveryDays}` },
      { value: 'regional', label: `${this.settings.zones.regional.name} - ${this.settings.zones.regional.deliveryDays}` },
      { value: 'national', label: `${this.settings.zones.national.name} - ${this.settings.zones.national.deliveryDays}` }
    ];
  }
}

export const ShippingCalculator = new ShippingCalculatorClass();