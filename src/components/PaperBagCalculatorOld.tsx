import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, ShoppingBag, Info } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { 
  sbs2SheetsPricingData, 
  sbs1SheetPricingData, 
  keycolorPricingData, 
  kraftPricingData 
} from "@/data/paperBagPricing";

interface PaperBagPricing {
  baseData: any[];
  treatments: {
    foiling: number;
    spotUV: number;
  };
}

interface PaperBagCalculatorProps {
  pricing: PaperBagPricing;
  userName: string;
}

type PaperType = "sbs2sheets" | "sbs1sheet" | "keycolor" | "kraft";

export const PaperBagCalculator = ({ userName }: PaperBagCalculatorProps) => {
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
    totalCost: 0,
    sellingPrice: 0,
    perBagPrice: 0,
  });

  useEffect(() => {
    calculatePrice();
  }, [quantity, length, height, gusset, paperGSM, paperPrice, foiling, spotUV, embossing]);

  const calculatePrice = () => {
    // PAPER BAG CALCULATIONS - Based on provided Excel formulas
    
    // Flat Width Calculation - Complex tiered formula
    // Formula: IF(length+gusset+1<12, 12, IF(length+gusset+1<13, 13, IF(length+gusset+1<14, 14, IF(length+gusset+1<18, 18, IF(length+gusset+1<=20, 20, IF(length+gusset+1<=23, 23, IF(length+gusset+1<=25, 25, IF(length+gusset+1<=31, 31, length+gusset+1))))))))
    const calculateFlatWidth = (l: number, g: number): number => {
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

    // Flat Height Calculation - Complex tiered formula
    // Formula: IF(height+gusset*0.8+1<12, 12, IF(height+gusset*0.8+1<13, 13, IF(height+gusset*0.8+1<14, 14, IF(height+gusset*0.8+1<18, 18, IF(height+gusset*0.8+1<=20, 20, IF(height+gusset*0.8+1<=23, 23, IF(height+gusset*0.8+1<=25, 25, IF(height+gusset*0.8+1<=31, 31, height+gusset*0.8+1))))))))
    const calculateFlatHeight = (h: number, g: number): number => {
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

    const flatWidth = calculateFlatWidth(length, gusset);
    const flatHeight = calculateFlatHeight(height, gusset);
    const flatSize = flatWidth * flatHeight;

    // Paper Cost per Sheet Calculation
    // Formula: (flatWidth * flatHeight * paperGSM) / 3100 / 500 * paperPrice
    const paperCostPerSheet = (flatSize * paperGSM) / 3100 / 500 * paperPrice;

    // Total Sheets Needed
    // Formula: (quantity * 2) + 200
    const totalSheetsNeeded = (quantity * 2) + 200;

    // Total Paper Cost
    const totalPaperCost = paperCostPerSheet * totalSheetsNeeded;

    // Printing Cost Calculation - Tiered pricing
    // Formula: IF(totalSheetsNeeded<=2500, 2500, IF(totalSheetsNeeded<=2000, 3200, IF(totalSheetsNeeded<=3000, 4000, IF(totalSheetsNeeded<=4000, 4500, IF(totalSheetsNeeded<=5000, 5500, (totalSheetsNeeded/1000)*800)))))
    const getPrintingCost = (sheets: number): number => {
      if (sheets <= 2500) return 2500;
      if (sheets <= 2000) return 3200; // Note: This seems like an error in original formula, but keeping as per Excel
      if (sheets <= 3000) return 4000;
      if (sheets <= 4000) return 4500;
      if (sheets <= 5000) return 5500;
      return (sheets / 1000) * 800;
    };
    const printingCost = getPrintingCost(totalSheetsNeeded);

    // Lamination Cost Calculation
    // Formula: MAX(flatSize/250 * totalSheetsNeeded, 750)
    const laminationCost = Math.max((flatSize / 250) * totalSheetsNeeded, 750);

    // Die Cutting Cost Calculation
    // Formula: (totalSheetsNeeded/1000)*400
    const dieCuttingCost = (totalSheetsNeeded / 1000) * 400;

    // Bag Making Cost Calculation
    // Formula: quantity * 4.5
    const bagMakingCost = quantity * 4.5;

    // Foiling Cost Calculation
    // Formula: MAX(quantity*8, 3000)
    const foilingCost = foiling ? Math.max(quantity * 8, 3000) : 0;

    // Spot UV Cost Calculation
    // Formula: MAX(totalSheetsNeeded*5, 3000)
    const spotUVCost = spotUV ? Math.max(totalSheetsNeeded * 5, 3000) : 0;

    // Total Cost Calculation
    const totalCost = totalPaperCost + printingCost + laminationCost + dieCuttingCost + bagMakingCost + foilingCost + spotUVCost;

    // Selling Price Calculation
    // Formula: totalCost * 1.7
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
      totalCost: Math.round(totalCost * 100) / 100,
      sellingPrice: Math.round(sellingPrice * 100) / 100,
      perBagPrice: Math.round(perBagPrice * 100) / 100,
    });
  };

  const paperTypeOptions = [
    { value: "sbs2sheets", label: "SBS 2 Sheets" },
    { value: "sbs1sheet", label: "SBS 1 Sheet" },
    { value: "keycolor", label: "Keycolor Paper" },
    { value: "kraft", label: "Kraft Paper" },
  ];

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
    doc.text(`Length:`, 30, 100);
    doc.text(`${length}"`, 120, 100);
    
    doc.text(`Height:`, 30, 115);
    doc.text(`${height}"`, 120, 115);
    
    doc.text(`Gusset:`, 30, 130);
    doc.text(`${gusset}"`, 120, 130);
    
    doc.text(`Quantity:`, 30, 145);
    doc.text(`${quantity.toLocaleString('en-IN')} bags`, 120, 145);
    
    doc.text(`Paper GSM:`, 30, 160);
    doc.text(`${paperGSM}`, 120, 160);
    
    doc.text(`Flat Size:`, 30, 175);
    doc.text(`${results.flatWidth}" x ${results.flatHeight}" (${results.flatSize} sq in)`, 120, 175);
    
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
    
    doc.text(`Lamination Cost:`, 30, yPos);
    doc.text(`Rs. ${results.laminationCost.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 12;
    
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
    
    if (spotUV) {
      doc.text(`Spot UV Cost:`, 30, yPos);
      doc.text(`Rs. ${results.spotUVCost.toLocaleString('en-IN')}`, 120, yPos);
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
  
  const getGSMOptions = () => {
    if (paperType === "sbs2sheets" || paperType === "sbs1sheet") {
      return ["270", "300"];
    }
    return ["250"];
  };

  const getPricingData = () => {
    switch (paperType) {
      case "sbs2sheets":
        return sbs2SheetsPricingData;
      case "sbs1sheet":
        return sbs1SheetPricingData;
      case "keycolor":
        return keycolorPricingData;
      case "kraft":
        return kraftPricingData;
      default:
        return sbs2SheetsPricingData;
    }
  };

  const supportsSpotUV = paperType === "sbs2sheets" || paperType === "sbs1sheet";
  const supportsEmbossing = paperType === "keycolor" || paperType === "kraft";

  useEffect(() => {
    setPaperGSM(getGSMOptions()[0]);
    setSpotUV(false);
    setEmbossing(false);
  }, [paperType]);

  useEffect(() => {
    calculatePrice();
  }, [quantity, length, height, gusset, paperGSM, foiling, spotUV, embossing, paperType]);

  const calculatePrice = () => {
    if (!length || !height || !gusset) {
      setTotalPrice(0);
      setPerBagPrice(0);
      setMatchedData(null);
      return;
    }

    const lengthNum = parseFloat(length);
    const heightNum = parseFloat(height);
    const gussetNum = parseFloat(gusset);
    const qty = parseInt(quantity);
    const pricingData = getPricingData();

    // Find exact or closest match
    let bestMatch = null;
    let minDiff = Infinity;

    for (const row of pricingData) {
      const qtyMatch = row.Quantity === qty;
      const dimDiff = 
        Math.abs(row["Length (in)"] - lengthNum) +
        Math.abs(row["Height (in)"] - heightNum) +
        Math.abs(row["Gusset (in)"] - gussetNum);
      const gsmMatch = row["Paper GSM"] === parseInt(paperGSM);

      if (qtyMatch && gsmMatch && dimDiff < minDiff) {
        minDiff = dimDiff;
        bestMatch = row;
      }
    }

    if (bestMatch && minDiff < 2) {
      let price = bestMatch["Selling Price"];
      
      if (foiling && bestMatch["Foiling Cost"]) {
        price += bestMatch["Foiling Cost"];
      }
      if (spotUV && bestMatch["Spot UV Cost"]) {
        price += bestMatch["Spot UV Cost"];
      }
      if (embossing && bestMatch["Embossing"]) {
        price += bestMatch["Embossing"];
      }

      setTotalPrice(price);
      setPerBagPrice(price / qty);
      setMatchedData(bestMatch);
    } else {
      // Fallback calculation
      const flatWidth = lengthNum + gussetNum + 1;
      const flatHeight = heightNum + gussetNum * 0.7 + 1.5;
      const flatSize = flatWidth * flatHeight;
      
      let paperPrice = 70;
      if (paperType === "keycolor") paperPrice = 360;
      else if (paperType === "kraft") paperPrice = 80;
      else if (parseInt(paperGSM) === 300) paperPrice = 75;

      const paperCostPerSheet = (flatSize / 1550) * paperPrice;
      const sheetsNeeded = qty * 2.4;
      const totalPaperCost = paperCostPerSheet * sheetsNeeded;

      let basePrice = totalPaperCost * 1.7;
      
      if (foiling) basePrice += qty < 500 ? 3000 : qty < 1000 ? 4000 : 8000;
      if (spotUV) basePrice += qty < 500 ? 3000 : qty < 1000 ? 4000 : 8000;
      if (embossing) basePrice += qty < 500 ? 3000 : qty < 1000 ? 4000 : 8000;

      setTotalPrice(basePrice);
      setPerBagPrice(basePrice / qty);
      setMatchedData(null);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 45, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("QUOTATION", 105, 22, { align: "center" });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Paper Bag Manufacturing", 105, 32, { align: "center" });
    
    // Customer Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PREPARED FOR:", 20, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(userName, 20, 67);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 74);
    doc.text(`Quote #: PB${Date.now().toString().slice(-6)}`, 20, 81);
    
    // Specifications
    doc.setFillColor(245, 247, 250);
    doc.rect(20, 90, 170, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("BAG SPECIFICATIONS", 25, 96);
    
    let yPos = 108;
    doc.setFontSize(10);
    
    const specs = [
      { label: "Paper Type:", value: paperTypeOptions.find(p => p.value === paperType)?.label || "" },
      { label: "Quantity:", value: `${quantity} bags` },
      { label: "Dimensions:", value: `${length}" L × ${height}" H × ${gusset}" G` },
      { label: "Paper GSM:", value: paperGSM },
    ];
    
    specs.forEach((spec) => {
      doc.setFont("helvetica", "bold");
      doc.text(spec.label, 25, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(spec.value, 70, yPos);
      yPos += 8;
    });
    
    // Treatments
    const treatments = [];
    if (foiling) treatments.push("Foiling");
    if (spotUV) treatments.push("Spot UV");
    if (embossing) treatments.push("Embossing");
    
    if (treatments.length > 0) {
      yPos += 5;
      doc.setFillColor(245, 247, 250);
      doc.rect(20, yPos - 6, 170, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.text("FINISHING & TREATMENTS", 25, yPos);
      yPos += 12;
      
      doc.setFont("helvetica", "normal");
      treatments.forEach((treatment) => {
        doc.setFillColor(59, 130, 246);
        doc.circle(27, yPos - 1.5, 1.5, "F");
        doc.text(treatment, 32, yPos);
        yPos += 7;
      });
    }
    
    // Pricing Section
    yPos += 10;
    doc.setFillColor(59, 130, 246);
    doc.rect(20, yPos - 6, 170, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("PRICING DETAILS", 25, yPos);
    
    doc.setTextColor(0, 0, 0);
    yPos += 15;
    
    // Price breakdown
    doc.setFillColor(250, 250, 250);
    doc.rect(20, yPos - 5, 170, 35, "F");
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Unit Price:", 25, yPos);
    doc.setFont("helvetica", "bold");
    doc.text(`₹${perBagPrice.toFixed(2)} per bag`, 160, yPos, { align: "right" });
    
    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.text("Quantity:", 25, yPos);
    doc.text(`${quantity} bags`, 160, yPos, { align: "right" });
    
    yPos += 15;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL AMOUNT:", 25, yPos);
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(16);
    doc.text(`₹${totalPrice.toFixed(2)}`, 160, yPos, { align: "right" });
    
    // Terms
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    yPos = 270;
    doc.text("Terms & Conditions:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text("• Prices are valid for 30 days from the date of quotation", 20, yPos + 5);
    doc.text("• 50% advance payment required to confirm order", 20, yPos + 10);
    doc.text("• Delivery time: 10-15 working days from order confirmation", 20, yPos + 15);
    
    // Footer
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 287, 210, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("Thank you for your business!", 105, 293, { align: "center" });
    
    doc.save(`Paper_Bag_Quotation_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Professional quotation downloaded!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="shadow-[var(--shadow-card)] border-2 border-primary/10">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Paper Bag Price Calculator
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Select paper type and enter bag specifications to get instant pricing
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Paper Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="paperType" className="text-base font-semibold">Paper Type</Label>
            <Select value={paperType} onValueChange={(value) => setPaperType(value as PaperType)}>
              <SelectTrigger id="paperType" className="h-12 text-base">
                <SelectValue placeholder="Select paper type" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {paperTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-base">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Select value={quantity} onValueChange={setQuantity}>
                <SelectTrigger id="quantity" className="bg-background z-50">
                  <SelectValue placeholder="Select quantity" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {quantities.map((qty) => (
                    <SelectItem key={qty} value={qty}>
                      {qty} bags
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Length (inches)</Label>
              <Input
                id="length"
                type="number"
                step="0.1"
                placeholder="e.g., 11.9"
                value={length === '0' || length === '' ? '' : length}
                onChange={(e) => setLength(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (inches)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="e.g., 8.5"
                value={height === '0' || height === '' ? '' : height}
                onChange={(e) => setHeight(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gusset">Gusset (inches)</Label>
              <Input
                id="gusset"
                type="number"
                step="0.1"
                placeholder="e.g., 3.35"
                value={gusset === '0' || gusset === '' ? '' : gusset}
                onChange={(e) => setGusset(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paperGSM">Paper GSM</Label>
              <Select value={paperGSM} onValueChange={setPaperGSM}>
                <SelectTrigger id="paperGSM" className="bg-background z-50">
                  <SelectValue placeholder="Select GSM" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {getGSMOptions().map((gsm) => (
                    <SelectItem key={gsm} value={gsm}>
                      {gsm} GSM
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Treatments */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">Finishing & Treatments</Label>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="foiling"
                  checked={foiling}
                  onCheckedChange={(checked) => setFoiling(checked as boolean)}
                />
                <label htmlFor="foiling" className="text-sm font-medium cursor-pointer">
                  Foiling
                </label>
              </div>
              {supportsSpotUV && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="spotUV"
                    checked={spotUV}
                    onCheckedChange={(checked) => setSpotUV(checked as boolean)}
                  />
                  <label htmlFor="spotUV" className="text-sm font-medium cursor-pointer">
                    Spot UV
                  </label>
                </div>
              )}
              {supportsEmbossing && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="embossing"
                    checked={embossing}
                    onCheckedChange={(checked) => setEmbossing(checked as boolean)}
                  />
                  <label htmlFor="embossing" className="text-sm font-medium cursor-pointer">
                    Embossing
                  </label>
                </div>
              )}
            </div>
          </div>

          {matchedData && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Exact pricing match found for your specifications
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-elegant)] border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <CardTitle className="text-2xl">Price Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Price per bag</p>
              <p className="text-2xl font-bold">₹{perBagPrice.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="text-2xl font-bold">{quantity} bags</p>
            </div>
          </div>
          
          <div className="pt-4 border-t-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">Total Amount:</span>
              <span className="text-3xl font-bold text-primary">₹{totalPrice.toFixed(2)}</span>
            </div>
            <Button
              onClick={generatePDF}
              className="w-full h-12 text-base"
              size="lg"
              disabled={totalPrice === 0}
            >
              <Download className="mr-2 h-5 w-5" />
              Download Professional Quotation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
