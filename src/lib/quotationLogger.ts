/**
 * Quotation Logger for saving and managing quotations
 * Stores quotations in localStorage with timestamps and generates unique references
 */

export interface QuotationData {
  id: string;
  userName: string;
  calculatorType: 'box' | 'digital-print' | 'brochure' | 'paper-bag';
  specifications: any;
  pricing: {
    baseAmount: number;
    gstAmount: number;
    shippingCharges: number;
    totalAmount: number;
  };
  timestamp: string;
  dateCreated: Date;
}

class QuotationLoggerClass {
  private storageKey = 'quotationHistory';

  public saveQuotation(_data: Omit<QuotationData, 'id' | 'timestamp' | 'dateCreated'>): string {
    // Disabled: return a generated reference but do not persist
    return `QT-${Date.now().toString().slice(-6)}`;
  }

  public getQuotationHistory(): QuotationData[] {
    // Disabled: always return empty
    return [];
  }

  public getQuotationById(_id: string): QuotationData | null {
    // Disabled
    return null;
  }

  public deleteQuotation(_id: string): boolean {
    // Disabled
    return false;
  }

  public clearHistory(): void {
    // Disabled
  }

  public exportHistory(): string {
    // Disabled
    return '[]';
  }

  public getStatistics() {
    // Disabled
    return {
      total: 0,
      today: 0,
      thisMonth: 0,
      totalValue: 0,
      byCalculator: {
        box: 0,
        digitalPrint: 0,
        brochure: 0,
        paperBag: 0,
      }
    };
  }

  private generateQuoteRef(calculatorType: string): string {
    const prefixes = {
      'box': 'BX',
      'digital-print': 'DP',
      'brochure': 'BR',
      'paper-bag': 'PB'
    };

    const prefix = prefixes[calculatorType as keyof typeof prefixes] || 'QT';
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp.slice(-6)}${random}`;
  }
}

export const QuotationLogger = new QuotationLoggerClass();