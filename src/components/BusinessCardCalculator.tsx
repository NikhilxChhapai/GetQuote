import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { IndianRupee, Printer, Sparkles, Layers, Download, FileText, Zap, Truck, Calculator as CalcIcon, Plus, Trash2 } from "lucide-react";
import jsPDF from 'jspdf';
import { ShippingCalculator } from "@/lib/shippingCalculator";
import { QuotationLogger } from "@/lib/quotationLogger";
import { SecureCostReveal } from "@/components/SecureCostReveal";

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
  userName?: string;
}

export const BusinessCardCalculator = ({ pricing, userName = "Guest" }: BusinessCardCalculatorProps) => {
  const [width, setWidth] = useState<number>(3.5);
  const [height, setHeight] = useState<number>(2);
  const [quantity, setQuantity] = useState<number>(500);
  const [paperType, setPaperType] = useState<string>("350 matt");
  const [shippingZone, setShippingZone] = useState<'local' | 'regional' | 'national'>('national');
  
  // Add-on costs
  const [addOns, setAddOns] = useState([
    { id: 1, description: '', cost: 0, enabled: false }
  ]);
  
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
    // New fields for GST and shipping
    baseAmount: 0,
    gstAmount: 0,
    gstRate: 18,
    shippingCharges: 0,
    shippingWeight: 0,
    finalTotal: 0,
    isFreeShipping: false,
    // Add-on costs
    addOnCosts: 0,
  });

  useEffect(() => {
    calculatePrice();
  }, [width, height, quantity, paperType, treatments, pricing, shippingZone, addOns]);

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
    
    // Calculate add-on costs
    const addOnCosts = addOns
      .filter(addon => addon.enabled && addon.cost > 0)
      .reduce((sum, addon) => sum + addon.cost, 0);
    
    const totalWithAddOns = totalCost + addOnCosts;
    const perPieceCost = totalWithAddOns / quantity;

    // Calculate GST and shipping
    const specifications = { width, height, quantity, paperType };
    const shippingCalc = ShippingCalculator.calculateTotal(
      totalWithAddOns,
      'digital-print',
      specifications,
      shippingZone
    );

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
      // GST and shipping fields
      baseAmount: Math.round(totalWithAddOns * 100) / 100,
      gstAmount: shippingCalc.gstAmount,
      gstRate: shippingCalc.gstRate,
      shippingCharges: shippingCalc.shippingCharges,
      shippingWeight: shippingCalc.shippingWeight,
      finalTotal: shippingCalc.totalAmount,
      isFreeShipping: shippingCalc.isFreeShipping,
      // Add-on costs
      addOnCosts: Math.round(addOnCosts * 100) / 100,
    });
  };

  const toggleTreatment = (treatment: keyof typeof treatments) => {
    setTreatments(prev => ({ ...prev, [treatment]: !prev[treatment] }));
  };

  // Add-on management functions
  const addNewAddOn = () => {
    const newId = Math.max(...addOns.map(a => a.id), 0) + 1;
    setAddOns(prev => [...prev, { id: newId, description: '', cost: 0, enabled: false }]);
  };

  const removeAddOn = (id: number) => {
    setAddOns(prev => prev.filter(addon => addon.id !== id));
  };

  const updateAddOn = (id: number, field: 'description' | 'cost' | 'enabled', value: string | number | boolean) => {
    setAddOns(prev => prev.map(addon => 
      addon.id === id ? { ...addon, [field]: value } : addon
    ));
  };

  const generatePDF = () => {
    // Save quotation to log
    const quoteRef = QuotationLogger.saveQuotation({
      userName,
      calculatorType: 'digital-print',
      specifications: { width, height, quantity, paperType, treatments, shippingZone },
      pricing: {
        baseAmount: results.baseAmount,
        gstAmount: results.gstAmount,
        shippingCharges: results.shippingCharges,
        totalAmount: results.finalTotal,
      }
    });

    const doc = new jsPDF();
    
    // Header with better formatting
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text('DIGITAL PRINT QUOTATION', 20, 30);
    
    // Date and reference
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const today = new Date();
    doc.text(`Generated on: ${today.toLocaleDateString('en-IN')}`, 20, 45);
    doc.text(`Quote Ref: ${quoteRef}`, 20, 55);
    doc.text(`Customer: ${userName}`, 20, 65);
    
    // Specifications section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('SPECIFICATIONS:', 20, 75);
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Dimensions:`, 30, 90);
    doc.text(`${width}" x ${height}"`, 120, 90);
    
    doc.text(`Quantity:`, 30, 105);
    doc.text(`${quantity.toLocaleString('en-IN')} pieces`, 120, 105);
    
    doc.text(`Paper Type:`, 30, 120);
    doc.text(`${paperType}`, 120, 120);
    
    doc.text(`Sheets Needed:`, 30, 135);
    doc.text(`${results.sheetsNeeded}`, 120, 135);
    
    doc.text(`Pieces per Sheet:`, 30, 150);
    doc.text(`${results.upsPerSheet}`, 120, 150);
    
    // Special Treatments section
    let yPos = 170;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('SPECIAL TREATMENTS:', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    const activeTreatments = Object.entries(treatments).filter(([_, active]) => active);
    if (activeTreatments.length > 0) {
      activeTreatments.forEach(([treatment, _]) => {
        const treatmentName = treatment.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        const cost = results[`${treatment}Cost` as keyof typeof results] as number;
        doc.text(`• ${treatmentName}:`, 30, yPos);
        doc.text(`Rs. ${cost.toLocaleString('en-IN')}`, 120, yPos);
        yPos += 12;
      });
    } else {
      doc.text('• No special treatments selected', 30, yPos);
      yPos += 12;
    }
    
    // Cost Breakdown section
    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('COST BREAKDOWN:', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Paper Cost:`, 30, yPos);
    doc.text(`Rs. ${results.paperCost.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 12;
    
    // Add treatment costs if any
    if (activeTreatments.length > 0) {
      doc.text(`Treatment Costs:`, 30, yPos);
      const totalTreatmentCost = activeTreatments.reduce((sum, [treatment, _]) => {
        return sum + (results[`${treatment}Cost` as keyof typeof results] as number);
      }, 0);
      doc.text(`Rs. ${totalTreatmentCost.toLocaleString('en-IN')}`, 120, yPos);
      yPos += 12;
    }
    
    // Add-on costs if any
    const enabledAddOns = addOns.filter(addon => addon.enabled && addon.cost > 0);
    if (enabledAddOns.length > 0) {
      enabledAddOns.forEach(addon => {
        doc.text(`• ${addon.description}:`, 30, yPos);
        doc.text(`Rs. ${addon.cost.toLocaleString('en-IN')}`, 120, yPos);
        yPos += 12;
      });
    }
    
    doc.text(`Subtotal:`, 30, yPos);
    doc.text(`Rs. ${results.baseAmount.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 12;
    
    doc.text(`GST (${results.gstRate}%):`, 30, yPos);
    doc.text(`Rs. ${results.gstAmount.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 12;
    
    doc.text(`Shipping (${results.shippingWeight}kg):`, 30, yPos);
    if (results.isFreeShipping) {
      doc.text(`FREE`, 120, yPos);
    } else {
      doc.text(`Rs. ${results.shippingCharges.toLocaleString('en-IN')}`, 120, yPos);
    }
    yPos += 12;
    
    // Draw a line before total
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos + 5, 190, yPos + 5);
    yPos += 15;
    
    // Final Total
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 204);
    doc.text('FINAL TOTAL:', 20, yPos);
    doc.text(`Rs. ${results.finalTotal.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 20;
    
    // Per piece cost
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Per Piece Cost:', 20, yPos);
    doc.text(`Rs. ${(results.finalTotal / quantity).toFixed(2)}`, 120, yPos);
    
    // Footer with better formatting
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer generated quotation. All prices are in Indian Rupees.', 20, 280);
    doc.text('Valid for 30 days from the date of generation.', 20, 290);
    
    // Save the PDF
    doc.save(`Digital-Print-Quote-${today.toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
      {/* Input Section */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-md">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <span className="text-foreground font-bold">Digital Print Calculator</span>
              <div className="flex items-center gap-1 mt-1">
                <Zap className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-muted-foreground font-normal">Professional Quality Printing</span>
              </div>
            </div>
          </CardTitle>
          <CardDescription className="flex items-center gap-2 mt-2">
            <FileText className="h-4 w-4 text-blue-500" />
            Enter your digital print specifications and get instant pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width" className="flex items-center gap-2">
                Width (inches)
                <HelpTooltip content="Card width in inches. Typical size is 3.5 x 2 inches." />
              </Label>
              <Input
                id="width"
                type="number"
                value={width === 0 ? '' : width}
                onChange={(e) => setWidth(e.target.value === '' ? 0 : Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                min="0.1"
                step="0.1"
                placeholder="Enter width"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="flex items-center gap-2">
                Height (inches)
                <HelpTooltip content="Card height in inches. Standard height is 2 inches." />
              </Label>
              <Input
                id="height"
                type="number"
                value={height === 0 ? '' : height}
                onChange={(e) => setHeight(e.target.value === '' ? 0 : Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                min="0.1"
                step="0.1"
                placeholder="Enter height"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="flex items-center gap-2">
              Quantity
              <HelpTooltip content="Total number of cards. Includes a few extra sheets for wastage." />
            </Label>
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

          <div className="space-y-2">
            <Label htmlFor="paperType" className="flex items-center gap-2">
              Paper Type
              <HelpTooltip content="Select stock (e.g., 350 matt). Price depends on quantity tier." />
            </Label>
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

          <div className="space-y-2">
            <Label htmlFor="shippingZone" className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-600" />
              Shipping Zone
            </Label>
            <Select value={shippingZone} onValueChange={(value: 'local' | 'regional' | 'national') => setShippingZone(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local (Same City) - Fastest</SelectItem>
                <SelectItem value="regional">Regional (Same State) - 2-3 Days</SelectItem>
                <SelectItem value="national">National (Other States) - 4-7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-semibold flex items-center gap-2">
              Premium Treatments
              <HelpTooltip content="Optional finishes such as foiling, raised UV, letterpress, etc." />
            </Label>
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

          {/* Add-on Costs Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4 text-green-600" />
                Additional Costs
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewAddOn}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {addOns.map((addon) => (
                <div key={addon.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Checkbox
                    checked={addon.enabled}
                    onCheckedChange={(checked) => updateAddOn(addon.id, 'enabled', checked as boolean)}
                  />
                  <Input
                    placeholder="Description (e.g., Design charges)"
                    value={addon.description}
                    onChange={(e) => updateAddOn(addon.id, 'description', e.target.value)}
                    className="flex-1 h-8 text-sm"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={addon.cost === 0 ? '' : addon.cost}
                      onChange={(e) => updateAddOn(addon.id, 'cost', e.target.value === '' ? 0 : Number(e.target.value))}
                      onFocus={(e) => e.target.select()}
                      className="w-20 h-8 text-sm"
                      min="0"
                    />
                  </div>
                  {addOns.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAddOn(addon.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {results.addOnCosts > 0 && (
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Total Add-ons</span>
                <span className="text-sm font-mono text-green-700 dark:text-green-300">₹{results.addOnCosts.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-4 lg:space-y-6">
        <SecureCostReveal>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <IndianRupee className="h-5 w-5 text-primary" />
                Internal Cost Breakdown
              </CardTitle>
              <CardDescription>Unlock to review production costs and process breakdown.</CardDescription>
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
        </SecureCostReveal>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-accent text-accent-foreground">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <span className="text-foreground">Client Quote</span>
                <div className="flex items-center gap-1 mt-1">
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-muted-foreground font-normal">Markup included</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                <span className="text-lg font-bold text-foreground">Final Total:</span>
                <span className="text-3xl font-bold text-foreground">₹{results.finalTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                <span className="text-sm">Per Piece Cost:</span>
                <span className="text-xl font-semibold text-foreground">₹{(results.finalTotal / quantity).toFixed(2)}</span>
              </div>

              <SecureCostReveal triggerLabel="Unlock Actual Cost">
                <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Print Cost</span>
                    <span className="text-sm font-semibold">₹{results.totalCost.toLocaleString('en-IN')}</span>
                  </div>
                  {results.addOnCosts > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Plus className="h-3 w-3" />
                        Add-ons
                      </span>
                      <span className="text-sm font-semibold">₹{results.addOnCosts.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="text-sm font-semibold">₹{results.baseAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <CalcIcon className="h-3 w-3" />
                      GST ({results.gstRate}%)
                    </span>
                    <span className="text-sm font-semibold">₹{results.gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Shipping ({results.shippingWeight}kg)
                    </span>
                    <span className="text-sm font-semibold">
                      {results.isFreeShipping ? 'FREE' : `₹${results.shippingCharges.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>
              </SecureCostReveal>
            </div>
            
            {/* PDF Download Button */}
            <div className="pt-4 border-t">
              <Button 
                onClick={generatePDF}
                className="w-full"
                size="lg"
              >
                <Download className="h-5 w-5 mr-2" />
                Download PDF Quote
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};