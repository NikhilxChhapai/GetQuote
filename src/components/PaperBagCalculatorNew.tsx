import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, ShoppingBag, Info, FileText, IndianRupee } from "lucide-react";
import jsPDF from "jspdf";

interface PaperBagCalculatorProps {
  userName: string;
}

type PaperBagType = 'sbs1' | 'sbs2' | 'keycolor' | 'kraft';

export const PaperBagCalculator = ({ userName }: PaperBagCalculatorProps) => {
  const [bagType, setBagType] = useState<PaperBagType>('sbs2');
  const [quantity, setQuantity] = useState<number>(100);
  const [length, setLength] = useState<number>(11.9);
  const [height, setHeight] = useState<number>(8.5);
  const [gusset, setGusset] = useState<number>(3.35);
  const [paperGSM, setPaperGSM] = useState<number>(270);
  const [paperPrice, setPaperPrice] = useState<number>(70);
  const [foiling, setFoiling] = useState(false);
  const [spotUV, setSpotUV] = useState(false);
  const [embossing, setEmbossing] = useState(false);
  
  const [results, setResults] = useState({
    flatWidth: 0,
    flatHeight: 0,
    flatSize: 0,
    paperCostPerSheet: 0,
    totalSheetsNeeded: 0,
    totalPaperCost: 0,
    printingCost: 0,
    laminationCost: 0,
    dieCuttingCost: 0,
    bagMakingCost: 0,
    foilingCost: 0,
    spotUVCost: 0,
    embossingCost: 0,
    totalCost: 0,
    sellingPrice: 0,
    perBagPrice: 0,
  });

  useEffect(() => {
    calculatePrice();
  }, [bagType, quantity, length, height, gusset, paperGSM, paperPrice, foiling, spotUV, embossing]);

  const calculatePrice = () => {
    // PAPER BAG CALCULATIONS - Based on provided Excel formulas for different bag types
    
    let flatWidth: number;
    let flatHeight: number;
    let paperCostPerSheet: number;
    let totalSheetsNeeded: number;
    let printingCost: number;
    let laminationCost: number;
    let dieCuttingCost: number;
    let bagMakingCost: number;
    let foilingCost: number;
    let spotUVCost: number;
    let embossingCost: number;

    if (bagType === 'sbs1') {
      // SBS 1 Sheet Calculations
      
      // Flat Width Calculation - SBS1 uses (L+G)*2+1 formula
      const calculateSBS1FlatWidth = (l: number, g: number): number => {
        const sum = (l + g) * 2 + 1;
        if (sum < 12) return 12;
        if (sum < 13) return 13;
        if (sum < 14) return 14;
        if (sum < 18) return 18;
        if (sum <= 20) return 20;
        if (sum <= 23) return 23;
        if (sum <= 25) return 25;
        if (sum <= 31) return 31;
        return sum;
      };

      // Flat Height Calculation - SBS1 uses H+G*0.8+1 formula
      const calculateSBS1FlatHeight = (h: number, g: number): number => {
        const sum = h + (g * 0.8) + 1;
        if (sum < 12) return 12;
        if (sum < 13) return 13;
        if (sum < 14) return 14;
        if (sum < 18) return 18;
        if (sum <= 20) return 20;
        if (sum <= 23) return 23;
        if (sum <= 25) return 25;
        if (sum <= 31) return 31;
        return sum;
      };

      flatWidth = calculateSBS1FlatWidth(length, gusset);
      flatHeight = calculateSBS1FlatHeight(height, gusset);
      
      // Paper Cost per Sheet: (flatWidth * flatHeight * paperGSM) / 3100 / 500 * paperPrice
      paperCostPerSheet = (flatWidth * flatHeight * paperGSM) / 3100 / 500 * paperPrice;
      
      // Total Sheets Needed: quantity + 200
      totalSheetsNeeded = quantity + 200;
      
      // Printing Cost - SBS1 specific formula
      if (totalSheetsNeeded <= 2500) {
        printingCost = 2500;
      } else if (totalSheetsNeeded <= 2000) {
        printingCost = 3200;
      } else if (totalSheetsNeeded <= 3000) {
        printingCost = 4000;
      } else if (totalSheetsNeeded <= 4000) {
        printingCost = 4500;
      } else if (totalSheetsNeeded <= 5000) {
        printingCost = 5500;
      } else {
        printingCost = (totalSheetsNeeded / 1000) * 800;
      }
      
      // Lamination Cost: MAX(flatSize/250 * totalSheetsNeeded, 750)
      laminationCost = Math.max((flatWidth * flatHeight / 250) * totalSheetsNeeded, 750);
      
      // Die Cutting Cost: (totalSheetsNeeded/1000)*400
      dieCuttingCost = (totalSheetsNeeded / 1000) * 400;
      
      // Bag Making Cost: quantity * 4.5
      bagMakingCost = quantity * 4.5;
      
      // Foiling Cost: MAX(quantity*8, 3000)
      foilingCost = foiling ? Math.max(quantity * 8, 3000) : 0;
      
      // Spot UV Cost: MAX(totalSheetsNeeded*5, 3000)
      spotUVCost = spotUV ? Math.max(totalSheetsNeeded * 5, 3000) : 0;
      
      embossingCost = 0; // SBS1 doesn't have embossing

    } else if (bagType === 'sbs2') {
      // SBS 2 Sheet Calculations
      
      // Flat Width Calculation - SBS2 uses L+G+1 formula (different from SBS1)
      const calculateSBS2FlatWidth = (l: number, g: number): number => {
        const sum = l + g + 1;
        if (sum < 12) return 12;
        if (sum < 13) return 13;
        if (sum < 14) return 14;
        if (sum < 18) return 18;
        if (sum <= 20) return 20;
        if (sum <= 23) return 23;
        if (sum <= 25) return 25;
        if (sum <= 31) return 31;
        return sum;
      };

      // Flat Height Calculation - SBS2 uses H+G*0.8+1 formula (same as SBS1)
      const calculateSBS2FlatHeight = (h: number, g: number): number => {
        const sum = h + (g * 0.8) + 1;
        if (sum < 12) return 12;
        if (sum < 13) return 13;
        if (sum < 14) return 14;
        if (sum < 18) return 18;
        if (sum <= 20) return 20;
        if (sum <= 23) return 23;
        if (sum <= 25) return 25;
        if (sum <= 31) return 31;
        return sum;
      };

      flatWidth = calculateSBS2FlatWidth(length, gusset);
      flatHeight = calculateSBS2FlatHeight(height, gusset);
      
      // Paper Cost per Sheet: (flatWidth * flatHeight * paperGSM) / 3100 / 500 * paperPrice
      paperCostPerSheet = (flatWidth * flatHeight * paperGSM) / 3100 / 500 * paperPrice;
      
      // Total Sheets Needed: (quantity * 2) + 200 (different from SBS1)
      totalSheetsNeeded = (quantity * 2) + 200;
      
      // Printing Cost - SBS2 specific formula
      // IF(K<=2500, 2500, IF(K<=2000, 3200, IF(K<=3000, 4000, IF(K<=4000, 4500, IF(K<=5000, 5500, (K/1000)*800)))))
      if (totalSheetsNeeded <= 2500) {
        printingCost = 2500;
      } else if (totalSheetsNeeded <= 2000) {
        printingCost = 3200;
      } else if (totalSheetsNeeded <= 3000) {
        printingCost = 4000;
      } else if (totalSheetsNeeded <= 4000) {
        printingCost = 4500;
      } else if (totalSheetsNeeded <= 5000) {
        printingCost = 5500;
      } else {
        printingCost = (totalSheetsNeeded / 1000) * 800;
      }
      
      // Lamination Cost: MAX(flatSize/250 * totalSheetsNeeded, 750)
      laminationCost = Math.max((flatWidth * flatHeight / 250) * totalSheetsNeeded, 750);
      
      // Die Cutting Cost: (totalSheetsNeeded/1000)*400
      dieCuttingCost = (totalSheetsNeeded / 1000) * 400;
      
      // Bag Making Cost: quantity * 4.5 (can vary to quantity * 7, using 4.5 as default)
      bagMakingCost = quantity * 4.5;
      
      // Foiling Cost: MAX(quantity*8, 3000) (can vary to MAX(sheets*6, 3000), using quantity*8 as default)
      foilingCost = foiling ? Math.max(quantity * 8, 3000) : 0;
      
      // Spot UV Cost: MAX(totalSheetsNeeded*5, 3000) (can be 0, using MAX as default)
      spotUVCost = spotUV ? Math.max(totalSheetsNeeded * 5, 3000) : 0;
      
      embossingCost = 0; // SBS2 doesn't have embossing

    } else if (bagType === 'keycolor') {
      // Keycolor Paper Bag Calculations
      
      // Flat Width Calculation - Keycolor uses L+G+1 formula (simpler)
      const calculateKeycolorFlatWidth = (l: number, g: number): number => {
        const sum = l + g + 1;
        if (sum < 12) return 12;
        if (sum < 18) return 18;
        if (sum <= 23) return 23;
        if (sum <= 25) return 25;
        return sum;
      };

      // Flat Height Calculation - Keycolor uses H+G*0.8+1 formula
      const calculateKeycolorFlatHeight = (h: number, g: number): number => {
        const sum = h + (g * 0.8) + 1;
        if (sum < 12) return 12;
        if (sum < 18) return 18;
        if (sum <= 23) return 23;
        if (sum <= 25) return 25;
        return sum;
      };

      flatWidth = calculateKeycolorFlatWidth(length, gusset);
      flatHeight = calculateKeycolorFlatHeight(height, gusset);
      
      // Paper Cost per Sheet: (flatWidth * flatHeight * paperGSM) / 3100 / 500 * paperPrice
      paperCostPerSheet = (flatWidth * flatHeight * paperGSM) / 3100 / 500 * paperPrice;
      
      // Total Sheets Needed: (quantity * 2) + 200
      totalSheetsNeeded = (quantity * 2) + 200;
      
      // Printing Cost - Keycolor specific (different from SBS1)
      if (totalSheetsNeeded <= 2500) {
        printingCost = 2500;
      } else if (totalSheetsNeeded <= 2000) {
        printingCost = 3200;
      } else if (totalSheetsNeeded <= 3000) {
        printingCost = 4000;
      } else if (totalSheetsNeeded <= 4000) {
        printingCost = 4500;
      } else if (totalSheetsNeeded <= 5000) {
        printingCost = 5500;
      } else {
        printingCost = (totalSheetsNeeded / 1000) * 800;
      }
      
      // Lamination Cost: flatSize/250 * totalSheetsNeeded
      laminationCost = (flatWidth * flatHeight / 250) * totalSheetsNeeded;
      
      // Die Cutting Cost: (totalSheetsNeeded/1000)*400
      dieCuttingCost = (totalSheetsNeeded / 1000) * 400;
      
      // Bag Making Cost: quantity * 5 (higher for Keycolor)
      bagMakingCost = quantity * 5;
      
      // Foiling Cost: MAX(quantity*8, 3000)
      foilingCost = foiling ? Math.max(quantity * 8, 3000) : 0;
      
      spotUVCost = 0; // Keycolor doesn't have Spot UV
      
      // Embossing Cost: MAX(totalSheetsNeeded*5, 3000)
      embossingCost = embossing ? Math.max(totalSheetsNeeded * 5, 3000) : 0;

    } else { // kraft
      // Kraft Paper Bag Calculations
      
      // Flat Width Calculation - Kraft uses L+G+1 formula with more tiers
      const calculateKraftFlatWidth = (l: number, g: number): number => {
        const sum = l + g + 1;
        if (sum < 12) return 12;
        if (sum < 13) return 13;
        if (sum < 14) return 14;
        if (sum < 18) return 18;
        if (sum <= 20) return 20;
        if (sum <= 23) return 23;
        if (sum <= 25) return 25;
        if (sum <= 31) return 31;
        return sum;
      };

      // Flat Height Calculation - Kraft uses H+G*0.8+1 formula
      const calculateKraftFlatHeight = (h: number, g: number): number => {
        const sum = h + (g * 0.8) + 1;
        if (sum < 12) return 12;
        if (sum < 13) return 13;
        if (sum < 14) return 14;
        if (sum < 18) return 18;
        if (sum <= 20) return 20;
        if (sum <= 23) return 23;
        if (sum <= 25) return 25;
        if (sum <= 31) return 31;
        return sum;
      };

      flatWidth = calculateKraftFlatWidth(length, gusset);
      flatHeight = calculateKraftFlatHeight(height, gusset);
      
      // Paper Cost per Sheet: (flatWidth * flatHeight * paperGSM) / 3100 / 500 * paperPrice
      paperCostPerSheet = (flatWidth * flatHeight * paperGSM) / 3100 / 500 * paperPrice;
      
      // Total Sheets Needed: (quantity * 2) + 100 (different from others)
      totalSheetsNeeded = (quantity * 2) + 100;
      
      // Printing Cost - Kraft specific (different pricing structure)
      if (totalSheetsNeeded <= 2500) {
        printingCost = 2000;
      } else if (totalSheetsNeeded <= 2000) {
        printingCost = 2200;
      } else if (totalSheetsNeeded <= 3000) {
        printingCost = 2800;
      } else if (totalSheetsNeeded <= 4000) {
        printingCost = 3200;
      } else if (totalSheetsNeeded <= 5000) {
        printingCost = 4000;
      } else {
        printingCost = (totalSheetsNeeded / 1000) * 500;
      }
      
      laminationCost = 0; // Kraft doesn't have lamination
      
      // Die Cutting Cost: (totalSheetsNeeded/1000)*400
      dieCuttingCost = (totalSheetsNeeded / 1000) * 400;
      
      // Bag Making Cost: quantity * 5
      bagMakingCost = quantity * 5;
      
      // Foiling Cost: MAX(quantity*8, 3000)
      foilingCost = foiling ? Math.max(quantity * 8, 3000) : 0;
      
      spotUVCost = 0; // Kraft doesn't have Spot UV
      
      // Embossing Cost: MAX(totalSheetsNeeded*5, 3000)
      embossingCost = embossing ? Math.max(totalSheetsNeeded * 5, 3000) : 0;
    }

    const flatSize = flatWidth * flatHeight;
    const totalPaperCost = paperCostPerSheet * totalSheetsNeeded;

    // Total Cost Calculation
    const totalCost = totalPaperCost + printingCost + laminationCost + dieCuttingCost + bagMakingCost + foilingCost + spotUVCost + embossingCost;

    // Selling Price Calculation - 70% markup (1.7x)
    const sellingPrice = totalCost * 1.7;

    // Per Bag Price
    const perBagPrice = sellingPrice / quantity;

    setResults({
      flatWidth: Math.round(flatWidth * 100) / 100,
      flatHeight: Math.round(flatHeight * 100) / 100,
      flatSize: Math.round(flatSize * 100) / 100,
      paperCostPerSheet: Math.round(paperCostPerSheet * 100) / 100,
      totalSheetsNeeded,
      totalPaperCost: Math.round(totalPaperCost * 100) / 100,
      printingCost,
      laminationCost: Math.round(laminationCost * 100) / 100,
      dieCuttingCost: Math.round(dieCuttingCost * 100) / 100,
      bagMakingCost: Math.round(bagMakingCost * 100) / 100,
      foilingCost,
      spotUVCost,
      embossingCost,
      totalCost: Math.round(totalCost * 100) / 100,
      sellingPrice: Math.round(sellingPrice * 100) / 100,
      perBagPrice: Math.round(perBagPrice * 100) / 100,
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header with better formatting
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text('PAPER BAG QUOTATION', 20, 30);
    
    // Date and reference
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const today = new Date();
    doc.text(`Generated on: ${today.toLocaleDateString('en-IN')}`, 20, 45);
    doc.text(`Quote Ref: PB-${today.getTime().toString().slice(-6)}`, 20, 55);
    doc.text(`Customer: ${userName}`, 20, 65);
    
    // Specifications section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('BAG SPECIFICATIONS:', 20, 85);
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Bag Type:`, 30, 100);
    doc.text(`${bagType === 'sbs2' ? 'SBS 2 Sheet' : bagType === 'sbs1' ? 'SBS 1 Sheet' : bagType === 'keycolor' ? 'Keycolor Paper' : 'Kraft Paper'}`, 120, 100);
    
    doc.text(`Length:`, 30, 115);
    doc.text(`${length}"`, 120, 115);
    
    doc.text(`Height:`, 30, 130);
    doc.text(`${height}"`, 120, 130);
    
    doc.text(`Gusset:`, 30, 145);
    doc.text(`${gusset}"`, 120, 145);
    
    doc.text(`Quantity:`, 30, 160);
    doc.text(`${quantity.toLocaleString('en-IN')} bags`, 120, 160);
    
    doc.text(`Paper GSM:`, 30, 175);
    doc.text(`${paperGSM}`, 120, 175);
    
    doc.text(`Flat Size:`, 30, 190);
    doc.text(`${results.flatWidth}" x ${results.flatHeight}" (${results.flatSize} sq in)`, 120, 190);
    
    // Cost Breakdown section
    let yPos = 210;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('COST BREAKDOWN:', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Paper Cost:`, 30, yPos);
    doc.text(`Rs. ${results.totalPaperCost.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 12;
    
    doc.text(`Printing Cost:`, 30, yPos);
    doc.text(`Rs. ${results.printingCost.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 12;
    
    if (bagType !== 'kraft') {
      doc.text(`Lamination Cost:`, 30, yPos);
      doc.text(`Rs. ${results.laminationCost.toLocaleString('en-IN')}`, 120, yPos);
      yPos += 12;
    }
    
    doc.text(`Die Cutting Cost:`, 30, yPos);
    doc.text(`Rs. ${results.dieCuttingCost.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 12;
    
    doc.text(`Bag Making Cost:`, 30, yPos);
    doc.text(`Rs. ${results.bagMakingCost.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 12;
    
    if (foiling) {
      doc.text(`Foiling Cost:`, 30, yPos);
      doc.text(`Rs. ${results.foilingCost.toLocaleString('en-IN')}`, 120, yPos);
      yPos += 12;
    }
    
    if (spotUV && (bagType === 'sbs1' || bagType === 'sbs2')) {
      doc.text(`Spot UV Cost:`, 30, yPos);
      doc.text(`Rs. ${results.spotUVCost.toLocaleString('en-IN')}`, 120, yPos);
      yPos += 12;
    }
    
    if (embossing && (bagType === 'keycolor' || bagType === 'kraft')) {
      doc.text(`Embossing Cost:`, 30, yPos);
      doc.text(`Rs. ${results.embossingCost.toLocaleString('en-IN')}`, 120, yPos);
      yPos += 12;
    }
    
    // Draw a line before total
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos + 5, 190, yPos + 5);
    yPos += 15;
    
    // Total Cost
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 204);
    doc.text('TOTAL COST:', 20, yPos);
    doc.text(`Rs. ${results.totalCost.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 20;
    
    // Selling Price
    doc.setFontSize(16);
    doc.setTextColor(0, 150, 0);
    doc.text('SELLING PRICE:', 20, yPos);
    doc.text(`Rs. ${results.sellingPrice.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 20;
    
    // Per bag cost
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Per Bag Price:', 20, yPos);
    doc.text(`Rs. ${results.perBagPrice.toFixed(2)}`, 120, yPos);
    
    // Footer with better formatting
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer generated quotation. All prices are in Indian Rupees.', 20, 280);
    doc.text('Selling price includes 70% markup. Valid for 30 days from the date of generation.', 20, 290);
    
    // Save the PDF
    doc.save(`Paper-Bag-Quote-${today.toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input Section */}
      <div className="space-y-6">
        <Card className="shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)]">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 text-white shadow-lg">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-bold">
                  {bagType === 'sbs2' ? 'SBS 2 Sheet' : bagType === 'sbs1' ? 'SBS 1 Sheet' : bagType === 'keycolor' ? 'Keycolor Paper' : 'Kraft Paper'} Calculator
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <Info className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-muted-foreground font-normal">Professional Bag Manufacturing</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bagType">Paper Bag Type</Label>
                <Select value={bagType} onValueChange={(value: PaperBagType) => setBagType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bag type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sbs2">SBS 2 Sheet</SelectItem>
                    <SelectItem value="sbs1">SBS 1 Sheet</SelectItem>
                    <SelectItem value="keycolor">Keycolor Paper</SelectItem>
                    <SelectItem value="kraft">Kraft Paper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length">Length (inches)</Label>
                <Input
                  id="length"
                  type="number"
                  value={length === 0 ? '' : length}
                  onChange={(e) => setLength(e.target.value === '' ? 0 : Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  min="1"
                  step="0.1"
                  placeholder="Enter length"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (inches)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height === 0 ? '' : height}
                  onChange={(e) => setHeight(e.target.value === '' ? 0 : Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  min="1"
                  step="0.1"
                  placeholder="Enter height"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gusset">Gusset (inches)</Label>
                <Input
                  id="gusset"
                  type="number"
                  value={gusset === 0 ? '' : gusset}
                  onChange={(e) => setGusset(e.target.value === '' ? 0 : Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  min="0.5"
                  step="0.1"
                  placeholder="Enter gusset"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity === 0 ? '' : quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? 0 : Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  min="1"
                  placeholder="Enter quantity"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paperGSM">Paper GSM</Label>
                <Input
                  id="paperGSM"
                  type="number"
                  value={paperGSM === 0 ? '' : paperGSM}
                  onChange={(e) => setPaperGSM(e.target.value === '' ? 0 : Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  min="200"
                  max="400"
                  placeholder="Enter GSM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paperPrice">Paper Price (₹/sheet)</Label>
                <Input
                  id="paperPrice"
                  type="number"
                  value={paperPrice === 0 ? '' : paperPrice}
                  onChange={(e) => setPaperPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  min="1"
                  placeholder="Enter price"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Label className="text-base font-semibold">Special Treatments</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="foiling"
                    checked={foiling}
                    onCheckedChange={(checked) => setFoiling(checked as boolean)}
                  />
                  <Label htmlFor="foiling" className="cursor-pointer">
                    Foiling (Premium finish)
                  </Label>
                </div>
                {(bagType === 'sbs1' || bagType === 'sbs2') && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="spotUV"
                      checked={spotUV}
                      onCheckedChange={(checked) => setSpotUV(checked as boolean)}
                    />
                    <Label htmlFor="spotUV" className="cursor-pointer">
                      Spot UV (Glossy coating)
                    </Label>
                  </div>
                )}
                {(bagType === 'keycolor' || bagType === 'kraft') && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="embossing"
                      checked={embossing}
                      onCheckedChange={(checked) => setEmbossing(checked as boolean)}
                    />
                    <Label htmlFor="embossing" className="cursor-pointer">
                      Embossing (Raised texture)
                    </Label>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <Card className="shadow-[var(--shadow-card)] bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <IndianRupee className="h-6 w-6 text-accent" />
              Price Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Paper Cost ({results.totalSheetsNeeded} sheets)</span>
                <span className="font-medium">₹{results.totalPaperCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Printing Cost</span>
                <span className="font-medium">₹{results.printingCost.toFixed(2)}</span>
              </div>
              {bagType !== 'kraft' && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Lamination Cost</span>
                  <span className="font-medium">₹{results.laminationCost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Die Cutting Cost</span>
                <span className="font-medium">₹{results.dieCuttingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Bag Making Cost</span>
                <span className="font-medium">₹{results.bagMakingCost.toFixed(2)}</span>
              </div>
              {foiling && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Foiling Cost</span>
                  <span className="font-medium">₹{results.foilingCost.toFixed(2)}</span>
                </div>
              )}
              {spotUV && (bagType === 'sbs1' || bagType === 'sbs2') && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Spot UV Cost</span>
                  <span className="font-medium">₹{results.spotUVCost.toFixed(2)}</span>
                </div>
              )}
              {embossing && (bagType === 'keycolor' || bagType === 'kraft') && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Embossing Cost</span>
                  <span className="font-medium">₹{results.embossingCost.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total Cost</span>
                  <span className="font-bold text-accent">₹{results.totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xl bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                  <span className="font-semibold text-green-700 dark:text-green-300">Selling Price (70% markup)</span>
                  <span className="font-bold text-green-700 dark:text-green-300">₹{results.sellingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Price per Bag</span>
                  <span className="font-bold text-accent">₹{results.perBagPrice.toFixed(2)}</span>
                </div>
              </div>
              
              {/* PDF Download Button */}
              <div className="pt-4 border-t">
                <Button 
                  onClick={generatePDF}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download PDF Quote
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Technical Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-green-600 mb-2">Bag Dimensions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flat Width:</span>
                    <span className="font-medium">{results.flatWidth}"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flat Height:</span>
                    <span className="font-medium">{results.flatHeight}"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flat Size:</span>
                    <span className="font-medium">{results.flatSize} sq in</span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-blue-600 mb-2">Production Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paper Cost/Sheet:</span>
                    <span className="font-medium">₹{results.paperCostPerSheet.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sheets:</span>
                    <span className="font-medium">{results.totalSheetsNeeded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Markup:</span>
                    <span className="font-medium">70% (1.7x)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
