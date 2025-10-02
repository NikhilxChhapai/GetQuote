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
  const [paperType, setPaperType] = useState<PaperType>("sbs2sheets");
  const [quantity, setQuantity] = useState("100");
  const [length, setLength] = useState("");
  const [height, setHeight] = useState("");
  const [gusset, setGusset] = useState("");
  const [paperGSM, setPaperGSM] = useState("270");
  const [foiling, setFoiling] = useState(false);
  const [spotUV, setSpotUV] = useState(false);
  const [embossing, setEmbossing] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [perBagPrice, setPerBagPrice] = useState(0);
  const [matchedData, setMatchedData] = useState<any>(null);

  const paperTypeOptions = [
    { value: "sbs2sheets", label: "SBS 2 Sheets" },
    { value: "sbs1sheet", label: "SBS 1 Sheet" },
    { value: "keycolor", label: "Keycolor Paper" },
    { value: "kraft", label: "Kraft Paper" },
  ];

  const quantities = ["60", "100", "200", "250", "300", "500", "800", "1000", "2000", "3000", "5000", "7500"];
  
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
