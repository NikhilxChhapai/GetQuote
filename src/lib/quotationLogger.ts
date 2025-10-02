// Quotation Logging System
export interface QuotationLog {
  id: string;
  timestamp: string;
  userName: string;
  calculatorType: 'box' | 'brochure' | 'digital-print' | 'paper-bag';
  specifications: Record<string, any>;
  pricing: {
    baseAmount: number;
    gstAmount: number;
    shippingCharges: number;
    totalAmount: number;
  };
  quoteReference: string;
}

export class QuotationLogger {
  private static readonly STORAGE_KEY = 'quotation_logs';

  // Save quotation to localStorage
  static saveQuotation(quotation: Omit<QuotationLog, 'id' | 'timestamp' | 'quoteReference'>): string {
    const id = this.generateId();
    const timestamp = new Date().toISOString();
    const quoteReference = this.generateQuoteReference(quotation.calculatorType);
    
    const fullQuotation: QuotationLog = {
      id,
      timestamp,
      quoteReference,
      ...quotation
    };

    const existingLogs = this.getAllQuotations();
    existingLogs.unshift(fullQuotation); // Add to beginning
    
    // Keep only last 100 quotations to prevent storage overflow
    const limitedLogs = existingLogs.slice(0, 100);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedLogs));
    
    console.log('Quotation saved:', {
      reference: quoteReference,
      timestamp: new Date(timestamp).toLocaleString('en-IN'),
      type: quotation.calculatorType,
      total: quotation.pricing.totalAmount
    });
    
    return quoteReference;
  }

  // Get all quotations
  static getAllQuotations(): QuotationLog[] {
    try {
      const logs = localStorage.getItem(this.STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error reading quotation logs:', error);
      return [];
    }
  }

  // Get quotations by user
  static getQuotationsByUser(userName: string): QuotationLog[] {
    return this.getAllQuotations().filter(log => log.userName === userName);
  }

  // Get quotations by type
  static getQuotationsByType(type: QuotationLog['calculatorType']): QuotationLog[] {
    return this.getAllQuotations().filter(log => log.calculatorType === type);
  }

  // Get quotation by reference
  static getQuotationByReference(reference: string): QuotationLog | null {
    return this.getAllQuotations().find(log => log.quoteReference === reference) || null;
  }

  // Generate unique ID
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Generate quote reference
  private static generateQuoteReference(type: QuotationLog['calculatorType']): string {
    const prefixes = {
      'box': 'BX',
      'brochure': 'BR',
      'digital-print': 'DP',
      'paper-bag': 'PB'
    };
    
    const prefix = prefixes[type];
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    
    return `${prefix}-${timestamp}-${random}`;
  }

  // Export quotations as JSON
  static exportQuotations(): string {
    const logs = this.getAllQuotations();
    return JSON.stringify(logs, null, 2);
  }

  // Clear all quotations (admin function)
  static clearAllQuotations(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('All quotation logs cleared');
  }

  // Get statistics
  static getStatistics() {
    const logs = this.getAllQuotations();
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    return {
      total: logs.length,
      today: logs.filter(log => new Date(log.timestamp).toDateString() === today).length,
      thisMonth: logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.getMonth() === thisMonth && logDate.getFullYear() === thisYear;
      }).length,
      byType: {
        box: logs.filter(log => log.calculatorType === 'box').length,
        brochure: logs.filter(log => log.calculatorType === 'brochure').length,
        digitalPrint: logs.filter(log => log.calculatorType === 'digital-print').length,
        paperBag: logs.filter(log => log.calculatorType === 'paper-bag').length,
      },
      totalRevenue: logs.reduce((sum, log) => sum + log.pricing.totalAmount, 0)
    };
  }
}
