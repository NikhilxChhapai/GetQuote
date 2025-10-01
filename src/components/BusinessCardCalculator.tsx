import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { IndianRupee, CreditCard, Sparkles, Layers } from "lucide-react";

interface BusinessCardPricing {
  paperTypes: {
    [key: string]: {
      [quantity: string]: number;
    };
  };
  treatments: {
    foilingDigital: number;
    raisedUV: number;
    foilpress: number;
    letterpress: number;
    embossing: number;
    electroplating: number;
    edgepaint: number;
    edgeGilding: number;
    laserCutting: number;
    stickerCutting: number;
  };
}

interface BusinessCardCalculatorProps {
  pricing: BusinessCardPricing;
}

export const BusinessCardCalculator = ({ pricing }: BusinessCardCalculatorProps) => {
  const [width, setWidth] = useState<number>(3.5);
  const [height, setHeight] = useState<number>(2);
  const [quantity, setQuantity] = useState<number>(500);
  const [paperType, setPaperType] = useState<string>("350 matt");
  
  const [treatments, setTreatments] = useState({
    foilingDigital: false,
    raisedUV: false,
    foilpress: false,
    letterpress: false,
    embossing: false,
    electroplating: false,
    edgepaint: false,
    edgeGilding: false,
    laserCutting: false,
    stickerCutting: false,
  });

  const [results, setResults] = useState({
    upsPerSheet: 0,
    sheetsNeeded: 0,
    paperCost: 0,
    foilingCost: 0,
    raisedUVCost: 0,
    foilpressCost: 0,
    letterpressCost: 0,
    embossingCost: 0,
    electroplatingCost: 0,
    edgepaintCost: 0,
    edgeGildingCost: 0,
    laserCuttingCost: 0,
    stickerCuttingCost: 0,
    totalCost: 0,
    perPieceCost: 0,
  });

  useEffect(() => {
    calculatePrice();
  }, [width, height, quantity, paperType, treatments, pricing]);

  const getPaperPricePerSheet = () => {
    const paperPricing = pricing.paperTypes[paperType];
    if (!paperPricing) return 20;

    // Find the closest quantity tier
    const quantities = Object.keys(paperPricing).map(Number).sort((a, b) => a - b);
    let selectedQuantity = quantities[0];
    
    for (const qty of quantities) {
      if (quantity >= qty) {
        selectedQuantity = qty;
      }
    }
    
    return paperPricing[selectedQuantity.toString()] || 20;
  };

  const calculatePrice = () => {
    // Calculate UPS (units per sheet) - assuming 12x18 inch sheet
    const sheetWidth = 12;
    const sheetHeight = 18;
    const cardsPerRow = Math.floor(sheetWidth / width);
    const cardsPerColumn = Math.floor(sheetHeight / height);
    const upsPerSheet = cardsPerRow * cardsPerColumn;
    
    // Calculate sheets needed (with 3 extra sheets for wastage)
    const theoreticalSheets = Math.ceil(quantity / Math.max(1, upsPerSheet));
    const sheetsNeeded = theoreticalSheets + 3;
    
    // Get paper price per sheet based on quantity tier
    const paperPricePerSheet = getPaperPricePerSheet();
    const paperCost = sheetsNeeded * paperPricePerSheet;
    
    // Calculate treatment costs
    const foilingCost = treatments.foilingDigital ? pricing.treatments.foilingDigital * (quantity / 100) : 0;
    const raisedUVCost = treatments.raisedUV ? pricing.treatments.raisedUV * (quantity / 100) : 0;
    const foilpressCost = treatments.foilpress ? pricing.treatments.foilpress * (quantity / 100) : 0;
    const letterpressCost = treatments.letterpress ? pricing.treatments.letterpress * (quantity / 100) : 0;
    const embossingCost = treatments.embossing ? pricing.treatments.embossing * (quantity / 100) : 0;
    const electroplatingCost = treatments.electroplating ? pricing.treatments.electroplating * (quantity / 100) : 0;
    const edgepaintCost = treatments.edgepaint ? pricing.treatments.edgepaint * (quantity / 100) : 0;
    const edgeGildingCost = treatments.edgeGilding ? pricing.treatments.edgeGilding * (quantity / 100) : 0;
    const laserCuttingCost = treatments.laserCutting ? pricing.treatments.laserCutting * (quantity / 100) : 0;
    const stickerCuttingCost = treatments.stickerCutting ? pricing.treatments.stickerCutting * (quantity / 100) : 0;
    
    const totalCost = 
      paperCost + 
      foilingCost + 
      raisedUVCost + 
      foilpressCost + 
      letterpressCost + 
      embossingCost + 
      electroplatingCost + 
      edgepaintCost + 
      edgeGildingCost + 
      laserCuttingCost + 
      stickerCuttingCost;
    
    const perPieceCost = totalCost / quantity;

    setResults({
      upsPerSheet,
      sheetsNeeded,
      paperCost: Math.round(paperCost * 100) / 100,
      foilingCost: Math.round(foilingCost * 100) / 100,
      raisedUVCost: Math.round(raisedUVCost * 100) / 100,
      foilpressCost: Math.round(foilpressCost * 100) / 100,
      letterpressCost: Math.round(letterpressCost * 100) / 100,
      embossingCost: Math.round(embossingCost * 100) / 100,
      electroplatingCost: Math.round(electroplatingCost * 100) / 100,
      edgepaintCost: Math.round(edgepaintCost * 100) / 100,
      edgeGildingCost: Math.round(edgeGildingCost * 100) / 100,
      laserCuttingCost: Math.round(laserCuttingCost * 100) / 100,
      stickerCuttingCost: Math.round(stickerCuttingCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      perPieceCost: Math.round(perPieceCost * 100) / 100,
    });
  };

  const toggleTreatment = (treatment: keyof typeof treatments) => {
    setTreatments(prev => ({ ...prev, [treatment]: !prev[treatment] }));
  };

  return (
    <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
      {/* Input Section */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="h-5 w-5 text-primary" />
            Business Card Specifications
          </CardTitle>
          <CardDescription>Enter your business card dimensions and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width (inches)</Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min="0.1"
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
                min="0.1"
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
            <Label htmlFor="paperType">Paper Type</Label>
            <Select value={paperType} onValueChange={setPaperType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(pricing.paperTypes).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-semibold">Premium Treatments</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="foilingDigital"
                  checked={treatments.foilingDigital}
                  onCheckedChange={() => toggleTreatment("foilingDigital")}
                />
                <Label htmlFor="foilingDigital" className="cursor-pointer font-normal text-sm">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Foiling Digital
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="raisedUV"
                  checked={treatments.raisedUV}
                  onCheckedChange={() => toggleTreatment("raisedUV")}
                />
                <Label htmlFor="raisedUV" className="cursor-pointer font-normal text-sm">
                  <Layers className="inline h-3 w-3 mr-1" />
                  Raised UV
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="foilpress"
                  checked={treatments.foilpress}
                  onCheckedChange={() => toggleTreatment("foilpress")}
                />
                <Label htmlFor="foilpress" className="cursor-pointer font-normal text-sm">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Foilpress
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="letterpress"
                  checked={treatments.letterpress}
                  onCheckedChange={() => toggleTreatment("letterpress")}
                />
                <Label htmlFor="letterpress" className="cursor-pointer font-normal text-sm">
                  <Layers className="inline h-3 w-3 mr-1" />
                  Letterpress
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="embossing"
                  checked={treatments.embossing}
                  onCheckedChange={() => toggleTreatment("embossing")}
                />
                <Label htmlFor="embossing" className="cursor-pointer font-normal text-sm">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Embossing
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="electroplating"
                  checked={treatments.electroplating}
                  onCheckedChange={() => toggleTreatment("electroplating")}
                />
                <Label htmlFor="electroplating" className="cursor-pointer font-normal text-sm">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Electroplating
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edgepaint"
                  checked={treatments.edgepaint}
                  onCheckedChange={() => toggleTreatment("edgepaint")}
                />
                <Label htmlFor="edgepaint" className="cursor-pointer font-normal text-sm">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Edge Paint
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edgeGilding"
                  checked={treatments.edgeGilding}
                  onCheckedChange={() => toggleTreatment("edgeGilding")}
                />
                <Label htmlFor="edgeGilding" className="cursor-pointer font-normal text-sm">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Edge Gilding
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="laserCutting"
                  checked={treatments.laserCutting}
                  onCheckedChange={() => toggleTreatment("laserCutting")}
                />
                <Label htmlFor="laserCutting" className="cursor-pointer font-normal text-sm">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Laser Cutting
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stickerCutting"
                  checked={treatments.stickerCutting}
                  onCheckedChange={() => toggleTreatment("stickerCutting")}
                />
                <Label htmlFor="stickerCutting" className="cursor-pointer font-normal text-sm">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Sticker Cutting
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-4 lg:space-y-6">
        <Card className="sticky top-24 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <IndianRupee className="h-5 w-5 text-primary" />
              Price Breakdown
            </CardTitle>
            <CardDescription>Detailed cost analysis for your business cards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">UPS per Sheet</span>
                <span className="text-sm">{results.upsPerSheet} cards</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Sheets Needed</span>
                <span className="text-sm">{results.sheetsNeeded} sheets</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Paper Cost</span>
                <span className="text-sm font-mono">₹{results.paperCost.toLocaleString('en-IN')}</span>
              </div>
              
              {treatments.foilingDigital && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Foiling Digital</span>
                  <span className="text-sm font-mono">₹{results.foilingCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              {treatments.raisedUV && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Raised UV</span>
                  <span className="text-sm font-mono">₹{results.raisedUVCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              {treatments.foilpress && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Foilpress</span>
                  <span className="text-sm font-mono">₹{results.foilpressCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              {treatments.letterpress && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Letterpress</span>
                  <span className="text-sm font-mono">₹{results.letterpressCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              {treatments.embossing && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Embossing</span>
                  <span className="text-sm font-mono">₹{results.embossingCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              {treatments.electroplating && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Electroplating</span>
                  <span className="text-sm font-mono">₹{results.electroplatingCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              {treatments.edgepaint && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Edge Paint</span>
                  <span className="text-sm font-mono">₹{results.edgepaintCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              {treatments.edgeGilding && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Edge Gilding</span>
                  <span className="text-sm font-mono">₹{results.edgeGildingCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              {treatments.laserCutting && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Laser Cutting</span>
                  <span className="text-sm font-mono">₹{results.laserCuttingCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              {treatments.stickerCutting && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Sticker Cutting</span>
                  <span className="text-sm font-mono">₹{results.stickerCuttingCost.toLocaleString('en-IN')}</span>
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