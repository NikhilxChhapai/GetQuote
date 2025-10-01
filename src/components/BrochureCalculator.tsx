import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { IndianRupee, FileText, Layers, Scissors, Package, Sparkles } from "lucide-react";

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
}

export const BrochureCalculator = ({ pricing }: BrochureCalculatorProps) => {
  const [length, setLength] = useState<number>(30);
  const [height, setHeight] = useState<number>(10);
  const [gusset, setGusset] = useState<number>(2);
  const [quantity, setQuantity] = useState<number>(500);
  const [paperGSM, setPaperGSM] = useState<string>("300");
  const [includeLamination, setIncludeLamination] = useState(true);
  const [includeFoiling, setIncludeFoiling] = useState(false);
  const [includeSpotUV, setIncludeSpotUV] = useState(false);
  const [includeEmbossing, setIncludeEmbossing] = useState(false);
  const [includePocket, setIncludePocket] = useState(false);

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
    perPieceCost: 0,
  });

  useEffect(() => {
    calculatePrice();
  }, [length, height, gusset, quantity, paperGSM, includeLamination, includeFoiling, includeSpotUV, includeEmbossing, includePocket, pricing]);

  const calculatePrice = () => {
    // Flat dimensions calculation
    const flatWidth = length + gusset + 1;
    const flatHeight = height + (gusset * 0.7) + 1.5;
    
    // Paper calculations
    const paperPrice = pricing.paperGSMPrices[paperGSM] || 100;
    const sheetArea = 36 * 12.5; // Standard sheet size in inches
    const brochureArea = flatWidth * flatHeight;
    const upsPerSheet = Math.floor(sheetArea / brochureArea);
    const paperCostPerSheet = (paperPrice * flatWidth * flatHeight) / sheetArea;
    
    // Total sheets needed (with 10% wastage)
    const theoreticalSheets = Math.ceil(quantity / Math.max(1, upsPerSheet));
    const totalSheetsNeeded = Math.ceil(theoreticalSheets * 1.1);
    
    const totalPaperCost = totalSheetsNeeded * paperCostPerSheet;
    
    // Printing cost based on quantity
    let printingCost = pricing.printingBase;
    if (quantity >= 5000) printingCost = pricing.printingBase * 1.0;
    else if (quantity >= 3000) printingCost = pricing.printingBase * 1.5;
    else if (quantity >= 2000) printingCost = pricing.printingBase * 1.3;
    else if (quantity >= 1000) printingCost = pricing.printingBase * 1.2;
    
    // Lamination cost
    const laminationCost = includeLamination ? (totalSheetsNeeded * pricing.laminationBase) / 500 : 0;
    
    // Die cutting cost
    const dieCuttingCost = (totalSheetsNeeded * pricing.dieCuttingBase) / 500;
    
    // Packing cost
    const packingCost = (quantity * pricing.packingBase) / 500;
    
    // Premium finishes
    const foilingCost = includeFoiling ? pricing.foilingBase * (quantity / 500) : 0;
    const spotUVCost = includeSpotUV ? pricing.spotUVBase * (quantity / 500) : 0;
    const embossingCost = includeEmbossing ? pricing.embossingBase * (quantity / 500) : 0;
    const pocketCost = includePocket ? pricing.pocketBase * (quantity / 500) : 0;
    
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
    
    const perPieceCost = totalCost / quantity;

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
      perPieceCost: Math.round(perPieceCost * 100) / 100,
    });
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
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                min="1"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (inches)</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min="1"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gusset">Gusset (inches)</Label>
              <Input
                id="gusset"
                type="number"
                value={gusset}
                onChange={(e) => setGusset(Number(e.target.value))}
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paperGSM">Paper GSM</Label>
            <Select value={paperGSM} onValueChange={setPaperGSM}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(pricing.paperGSMPrices).map((gsm) => (
                  <SelectItem key={gsm} value={gsm}>
                    {gsm} GSM - ₹{pricing.paperGSMPrices[gsm]}/sheet
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  Embossing
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
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg">Total Cost:</span>
                <span className="text-3xl font-bold">₹{results.totalCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-primary-foreground/20">
                <span className="text-sm opacity-90">Per Piece:</span>
                <span className="text-xl font-semibold">₹{results.perPieceCost.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};