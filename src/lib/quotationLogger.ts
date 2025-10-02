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

  public saveQuotation(data: Omit<QuotationData, 'id' | 'timestamp' | 'dateCreated'>): string {
    const now = new Date();
    const quotation: QuotationData = {
      ...data,
      id: this.generateQuoteRef(data.calculatorType),
      timestamp: now.toISOString(),
      dateCreated: now
    };

    const history = this.getQuotationHistory();
    history.unshift(quotation); // Add to beginning of array

    // Keep only last 100 quotations
    if (history.length > 100) {
      history.splice(100);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(history));
    return quotation.id;
  }

  public getQuotationHistory(): QuotationData[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        dateCreated: new Date(item.timestamp)
      }));
    } catch (error) {
      console.error('Error parsing quotation history:', error);
      return [];
    }
  }

  public getQuotationById(id: string): QuotationData | null {
    const history = this.getQuotationHistory();
    return history.find(q => q.id === id) || null;
  }

  public deleteQuotation(id: string): boolean {
    const history = this.getQuotationHistory();
    const filtered = history.filter(q => q.id !== id);
    
    if (filtered.length !== history.length) {
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    }
    return false;
  }

  public clearHistory(): void {
    localStorage.removeItem(this.storageKey);
  }

  public exportHistory(): string {
    const history = this.getQuotationHistory();
    return JSON.stringify(history, null, 2);
  }

  public getStatistics() {
    const history = this.getQuotationHistory();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: history.length,
      today: history.filter(q => q.dateCreated >= today).length,
      thisMonth: history.filter(q => q.dateCreated >= thisMonth).length,
      totalValue: history.reduce((sum, q) => sum + q.pricing.totalAmount, 0),
      byCalculator: {
        box: history.filter(q => q.calculatorType === 'box').length,
        digitalPrint: history.filter(q => q.calculatorType === 'digital-print').length,
        brochure: history.filter(q => q.calculatorType === 'brochure').length,
        paperBag: history.filter(q => q.calculatorType === 'paper-bag').length,
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