import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { IndianRupee, FileText, Layers, Scissors, Package, Sparkles, Download, Truck, Calculator as CalcIcon, Plus, Trash2 } from "lucide-react";
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/button";
import { ShippingCalculator } from "@/lib/shippingCalculator";
import { QuotationLogger } from "@/lib/quotationLogger";

interface BrochurePricing {
  paperGSMPrices: {
    [key: string]: number;
  };
  printingBase: number;
  laminationBase: number;
  dieCuttingBase: number;
  packingBase: number;
  foilingBase: number;
  spotUVBase: number;
  embossingBase: number;
  pocketBase: number;
}

interface BrochureCalculatorProps {
  pricing: BrochurePricing;
  userName?: string;
}

export const BrochureCalculator = ({ pricing, userName = "Guest" }: BrochureCalculatorProps) => {
  const [length, setLength] = useState<number>(36);
  const [height, setHeight] = useState<number>(12.5);
  const [gusset, setGusset] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(500);
  const [paperGSM, setPaperGSM] = useState<string>("300");
  const [paperPrice, setPaperPrice] = useState<number>(100);
  const [includeLamination, setIncludeLamination] = useState(true);
  const [includeFoiling, setIncludeFoiling] = useState(false);
  const [includeSpotUV, setIncludeSpotUV] = useState(false);
  const [includeEmbossing, setIncludeEmbossing] = useState(false);
  const [includePocket, setIncludePocket] = useState(false);
  const [shippingZone, setShippingZone] = useState<'local' | 'regional' | 'national'>('national');
  
  // Add-on costs
  const [addOns, setAddOns] = useState([
    { id: 1, description: '', cost: 0, enabled: false }
  ]);

  const [results, setResults] = useState({
    flatWidth: 0,
    flatHeight: 0,
    paperCostPerSheet: 0,
    totalSheetsNeeded: 0,
    totalPaperCost: 0,
    printingCost: 0,
    laminationCost: 0,
    dieCuttingCost: 0,
    packingCost: 0,
    foilingCost: 0,
    spotUVCost: 0,
    embossingCost: 0,
    pocketCost: 0,
    totalCost: 0,
    sellingPrice: 0,
    perPieceCost: 0,
    // GST and shipping fields
    baseAmount: 0,
    gstAmount: 0,
    gstRate: 18,
    shippingCharges: 0,
    shippingWeight: 0,
    finalTotal: 0,
    isFreeShipping: false,
    addOnCosts: 0,
  });

  useEffect(() => {
    calculatePrice();
  }, [length, height, gusset, quantity, paperGSM, paperPrice, includeLamination, includeFoiling, includeSpotUV, includeEmbossing, includePocket, pricing]);

  const calculatePrice = () => {
    // BROCHURE CALCULATIONS - Based on provided Excel formulas
    
    // Flat dimensions calculation - Excel formulas
    // Flat Width: L+G+1
    const flatWidth = length + gusset + 1;
    // Flat Height: H+G*0.7+1.5
    const flatHeight = height + (gusset * 0.7) + 1.5;
    
    // Paper calculations - Excel formulas
    // Use the paperPrice state directly
    
    // Paper Cost per Sheet: (flatWidth * flatHeight * paperGSM) / 3100 / 500 * paperPrice
    const paperCostPerSheet = (flatWidth * flatHeight * paperGSM) / 3100 / 500 * paperPrice;
    
    // Total Sheets Needed: quantity + 400
    const totalSheetsNeeded = quantity + 400;
    
    // Total Paper Cost
    const totalPaperCost = paperCostPerSheet * totalSheetsNeeded;
    
    // Printing Cost - Excel tiered formula
    // IF(totalSheetsNeeded<=1000, 5500, IF(totalSheetsNeeded<=2000, 6500, IF(totalSheetsNeeded<=3000, 7500, IF(totalSheetsNeeded<=4000, 8500, IF(totalSheetsNeeded<=5000, 10000, (totalSheetsNeeded/1000)*1000)))))
    let printingCost: number;
    if (totalSheetsNeeded <= 1000) {
      printingCost = 5500;
    } else if (totalSheetsNeeded <= 2000) {
      printingCost = 6500;
    } else if (totalSheetsNeeded <= 3000) {
      printingCost = 7500;
    } else if (totalSheetsNeeded <= 4000) {
      printingCost = 8500;
    } else if (totalSheetsNeeded <= 5000) {
      printingCost = 10000;
    } else {
      printingCost = (totalSheetsNeeded / 1000) * 1000;
    }
    
    // Lamination Cost: MAX(flatWidth*flatHeight/250 * totalSheetsNeeded, 750)
    const laminationCost = includeLamination ? Math.max((flatWidth * flatHeight / 250) * totalSheetsNeeded, 750) : 0;
    
    // Die Cutting Cost: (totalSheetsNeeded/1000)*1000
    const dieCuttingCost = (totalSheetsNeeded / 1000) * 1000;
    
    // Packing Cost: quantity * 2.5
    const packingCost = quantity * 2.5;
    
    // Foiling Cost: MAX(quantity*8, 5000)
    const foilingCost = includeFoiling ? Math.max(quantity * 8, 5000) : 0;
    
    // Spot UV Cost: MAX(totalSheetsNeeded*5, 6000)
    const spotUVCost = includeSpotUV ? Math.max(totalSheetsNeeded * 5, 6000) : 0;
    
    // EP (Embossing Press) Cost: quantity * 30
    const embossingCost = includeEmbossing ? quantity * 30 : 0;
    
    // Pocket Cost: quantity * 10
    const pocketCost = includePocket ? quantity * 10 : 0;
    
    // Total Cost
    const totalCost = 
      totalPaperCost + 
      printingCost + 
      laminationCost + 
      dieCuttingCost + 
      packingCost + 
      foilingCost + 
      spotUVCost + 
      embossingCost + 
      pocketCost;
    
    // Selling Price: totalCost * 1.7 (70% markup)
    const sellingPrice = totalCost * 1.7;
    
    // Per piece cost
    const perPieceCost = sellingPrice / quantity;

    setResults({
      flatWidth: Math.round(flatWidth * 100) / 100,
      flatHeight: Math.round(flatHeight * 100) / 100,
      paperCostPerSheet: Math.round(paperCostPerSheet * 100) / 100,
      totalSheetsNeeded,
      totalPaperCost: Math.round(totalPaperCost * 100) / 100,
      printingCost: Math.round(printingCost * 100) / 100,
      laminationCost: Math.round(laminationCost * 100) / 100,
      dieCuttingCost: Math.round(dieCuttingCost * 100) / 100,
      packingCost: Math.round(packingCost * 100) / 100,
      foilingCost: Math.round(foilingCost * 100) / 100,
      spotUVCost: Math.round(spotUVCost * 100) / 100,
      embossingCost: Math.round(embossingCost * 100) / 100,
      pocketCost: Math.round(pocketCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      sellingPrice: Math.round(sellingPrice * 100) / 100,
      perPieceCost: Math.round(perPieceCost * 100) / 100,
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header with better formatting
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text('BROCHURE QUOTATION', 20, 30);
    
    // Date and reference
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const today = new Date();
    doc.text(`Generated on: ${today.toLocaleDateString('en-IN')}`, 20, 45);
    doc.text(`Quote Ref: BR-${today.getTime().toString().slice(-6)}`, 20, 55);
    doc.text(`Customer: ${userName}`, 20, 65);
    
    // Specifications section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('BROCHURE SPECIFICATIONS:', 20, 85);
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Dimensions:`, 30, 100);
    doc.text(`${length}" x ${height}" x ${gusset}"`, 120, 100);
    
    doc.text(`Quantity:`, 30, 115);
    doc.text(`${quantity.toLocaleString('en-IN')} brochures`, 120, 115);
    
    doc.text(`Paper GSM:`, 30, 130);
    doc.text(`${paperGSM} GSM`, 120, 130);
    
    doc.text(`Paper Price:`, 30, 145);
    doc.text(`₹${paperPrice}/sheet`, 120, 145);
    
    doc.text(`Flat Size:`, 30, 160);
    doc.text(`${results.flatWidth.toFixed(2)}" x ${results.flatHeight.toFixed(2)}"`, 120, 160);
    
    doc.text(`Total Sheets Needed:`, 30, 175);
    doc.text(`${results.totalSheetsNeeded}`, 120, 175);
    
    // Cost Breakdown section
    let yPos = 195;
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
    
    if (includeLamination) {
      doc.text(`Lamination Cost:`, 30, yPos);
      doc.text(`Rs. ${results.laminationCost.toLocaleString('en-IN')}`, 120, yPos);
      yPos += 12;
    }
    
    doc.text(`Die Cutting Cost:`, 30, yPos);
    doc.text(`Rs. ${results.dieCuttingCost.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 12;
    
    doc.text(`Packing Cost:`, 30, yPos);
    doc.text(`Rs. ${results.packingCost.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 12;
    
    if (includeFoiling) {
      doc.text(`Foiling Cost:`, 30, yPos);
      doc.text(`Rs. ${results.foilingCost.toLocaleString('en-IN')}`, 120, yPos);
      yPos += 12;
    }
    
    if (includeSpotUV) {
      doc.text(`Spot UV Cost:`, 30, yPos);
      doc.text(`Rs. ${results.spotUVCost.toLocaleString('en-IN')}`, 120, yPos);
      yPos += 12;
    }
    
    if (includeEmbossing) {
      doc.text(`Embossing Cost:`, 30, yPos);
      doc.text(`Rs. ${results.embossingCost.toLocaleString('en-IN')}`, 120, yPos);
      yPos += 12;
    }
    
    if (includePocket) {
      doc.text(`Pocket Cost:`, 30, yPos);
      doc.text(`Rs. ${results.pocketCost.toLocaleString('en-IN')}`, 120, yPos);
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
    
    // Selling Price (with 70% markup)
    doc.setFontSize(16);
    doc.setTextColor(0, 150, 0);
    doc.text('SELLING PRICE:', 20, yPos);
    doc.text(`Rs. ${results.sellingPrice.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 20;
    
    // Per brochure cost
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Per Brochure Price:', 20, yPos);
    doc.text(`Rs. ${results.perPieceCost.toFixed(2)}`, 120, yPos);
    
    // Footer with better formatting
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer generated quotation. All prices are in Indian Rupees.', 20, 280);
    doc.text('Selling price includes 70% markup. Valid for 30 days from the date of generation.', 20, 290);
    
    // Save the PDF
    doc.save(`Brochure-Quote-${today.toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Input Section */}
      <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Brochure Specifications
          </CardTitle>
          <CardDescription>Enter your brochure dimensions and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="gusset">Gusset (inches)</Label>
              <Input
                id="gusset"
                type="number"
                value={gusset === 0 ? '' : gusset}
                onChange={(e) => setGusset(e.target.value === '' ? 0 : Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                min="0"
                step="0.1"
                placeholder="Enter gusset"
              />
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paperGSM">Paper GSM</Label>
              <Select value={paperGSM} onValueChange={setPaperGSM}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="250">250 GSM</SelectItem>
                  <SelectItem value="280">280 GSM</SelectItem>
                  <SelectItem value="300">300 GSM</SelectItem>
                  <SelectItem value="350">350 GSM</SelectItem>
                </SelectContent>
              </Select>
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
            <Label className="text-base font-semibold">Finishing Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lamination"
                  checked={includeLamination}
                  onCheckedChange={(checked) => setIncludeLamination(checked as boolean)}
                />
                <Label htmlFor="lamination" className="cursor-pointer font-normal">
                  <Layers className="inline h-4 w-4 mr-1" />
                  Lamination
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="foiling"
                  checked={includeFoiling}
                  onCheckedChange={(checked) => setIncludeFoiling(checked as boolean)}
                />
                <Label htmlFor="foiling" className="cursor-pointer font-normal">
                  <Sparkles className="inline h-4 w-4 mr-1" />
                  Foiling
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="spotUV"
                  checked={includeSpotUV}
                  onCheckedChange={(checked) => setIncludeSpotUV(checked as boolean)}
                />
                <Label htmlFor="spotUV" className="cursor-pointer font-normal">
                  <Sparkles className="inline h-4 w-4 mr-1" />
                  Spot UV
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="embossing"
                  checked={includeEmbossing}
                  onCheckedChange={(checked) => setIncludeEmbossing(checked as boolean)}
                />
                <Label htmlFor="embossing" className="cursor-pointer font-normal">
                  <Sparkles className="inline h-4 w-4 mr-1" />
                  EP (Embossing Press)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pocket"
                  checked={includePocket}
                  onCheckedChange={(checked) => setIncludePocket(checked as boolean)}
                />
                <Label htmlFor="pocket" className="cursor-pointer font-normal">
                  <Package className="inline h-4 w-4 mr-1" />
                  Pocket
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-6">
        <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              Price Breakdown
            </CardTitle>
            <CardDescription>Detailed cost analysis for your brochure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Flat Dimensions</span>
                <span className="text-sm">{results.flatWidth}" × {results.flatHeight}"</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Sheets Needed</span>
                <span className="text-sm">{results.totalSheetsNeeded} sheets</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Paper Cost</span>
                <span className="text-sm font-mono">₹{results.totalPaperCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Printing Cost</span>
                <span className="text-sm font-mono">₹{results.printingCost.toLocaleString('en-IN')}</span>
              </div>
              {includeLamination && (
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Lamination Cost</span>
                  <span className="text-sm font-mono">₹{results.laminationCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Die Cutting Cost</span>
                <span className="text-sm font-mono">₹{results.dieCuttingCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Packing Cost</span>
                <span className="text-sm font-mono">₹{results.packingCost.toLocaleString('en-IN')}</span>
              </div>
              {includeFoiling && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Foiling Cost</span>
                  <span className="text-sm font-mono">₹{results.foilingCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              {includeSpotUV && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Spot UV Cost</span>
                  <span className="text-sm font-mono">₹{results.spotUVCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              {includeEmbossing && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Embossing Cost</span>
                  <span className="text-sm font-mono">₹{results.embossingCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              {includePocket && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Pocket Cost</span>
                  <span className="text-sm font-mono">₹{results.pocketCost.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-elegant)] bg-[var(--gradient-primary)] text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-2xl">Total Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg">Total Cost:</span>
                  <span className="text-2xl font-bold">₹{results.totalCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-primary-foreground/20">
                  <span className="text-lg">Selling Price (70% markup):</span>
                  <span className="text-3xl font-bold text-green-300">₹{results.sellingPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-primary-foreground/20">
                  <span className="text-sm opacity-90">Per Piece:</span>
                  <span className="text-xl font-semibold">₹{results.perPieceCost.toFixed(2)}</span>
                </div>
              </div>
              
              {/* PDF Download Button */}
              <div className="pt-4 border-t border-primary-foreground/20">
                <Button 
                  onClick={generatePDF}
                  className="w-full bg-white text-primary hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download PDF Quote
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};