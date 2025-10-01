import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

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

export const PaperBagCalculator = ({ pricing, userName }: PaperBagCalculatorProps) => {
  const [quantity, setQuantity] = useState("100");
  const [length, setLength] = useState("");
  const [height, setHeight] = useState("");
  const [gusset, setGusset] = useState("");
  const [paperGSM, setPaperGSM] = useState("270");
  const [foiling, setFoiling] = useState(false);
  const [spotUV, setSpotUV] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [perBagPrice, setPerBagPrice] = useState(0);

  const quantities = ["100", "200", "250", "300", "500", "1000", "2000", "3000", "5000"];
  const gsmOptions = ["270", "300"];

  useEffect(() => {
    calculatePrice();
  }, [quantity, length, height, gusset, paperGSM, foiling, spotUV]);

  const calculatePrice = () => {
    if (!length || !height || !gusset) {
      setTotalPrice(0);
      setPerBagPrice(0);
      return;
    }

    const lengthNum = parseFloat(length);
    const heightNum = parseFloat(height);
    const gussetNum = parseFloat(gusset);
    const qty = parseInt(quantity);

    // Find closest match in pricing data
    const match = pricing.baseData.find((row) => {
      return (
        row.Quantity === qty &&
        Math.abs(row["Length (in)"] - lengthNum) < 0.5 &&
        Math.abs(row["Height (in)"] - heightNum) < 0.5 &&
        Math.abs(row["Gusset (in)"] - gussetNum) < 0.5 &&
        row["Paper GSM"] === parseInt(paperGSM)
      );
    });

    if (match) {
      let price = match["Selling Price"];
      
      // Add treatment costs
      if (foiling && match["Foiling Cost"]) {
        price += match["Foiling Cost"];
      }
      if (spotUV && match["Spot UV Cost"]) {
        price += match["Spot UV Cost"];
      }

      setTotalPrice(price);
      setPerBagPrice(price / qty);
    } else {
      // Fallback calculation
      const flatWidth = lengthNum + gussetNum + 1;
      const flatHeight = heightNum + gussetNum * 0.7 + 1.5;
      const flatSize = flatWidth * flatHeight;
      
      const paperPrice = parseInt(paperGSM) === 270 ? 70 : 75;
      const paperCostPerSheet = (flatSize / 1550) * paperPrice;
      const sheetsNeeded = qty * 2.4;
      const totalPaperCost = paperCostPerSheet * sheetsNeeded;

      let basePrice = totalPaperCost * 1.7; // Base multiplier
      
      if (foiling) basePrice += pricing.treatments.foiling;
      if (spotUV) basePrice += pricing.treatments.spotUV;

      setTotalPrice(basePrice);
      setPerBagPrice(basePrice / qty);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header with gradient effect
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("PRICE QUOTATION", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Paper Bag Manufacturing", 105, 30, { align: "center" });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Customer Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PREPARED FOR:", 20, 55);
    doc.setFont("helvetica", "normal");
    doc.text(userName, 20, 62);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 69);
    
    // Specifications Section
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 80, 170, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.text("BAG SPECIFICATIONS", 25, 86);
    
    doc.setFont("helvetica", "normal");
    let yPos = 96;
    
    const specs = [
      { label: "Quantity:", value: quantity },
      { label: "Length:", value: `${length} inches` },
      { label: "Height:", value: `${height} inches` },
      { label: "Gusset:", value: `${gusset} inches` },
      { label: "Paper GSM:", value: paperGSM },
    ];
    
    specs.forEach((spec) => {
      doc.setFont("helvetica", "bold");
      doc.text(spec.label, 25, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(spec.value, 70, yPos);
      yPos += 7;
    });
    
    // Additional Treatments
    if (foiling || spotUV) {
      yPos += 5;
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPos - 6, 170, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.text("ADDITIONAL TREATMENTS", 25, yPos);
      yPos += 10;
      
      doc.setFont("helvetica", "normal");
      if (foiling) {
        doc.text("✓ Foiling", 25, yPos);
        yPos += 7;
      }
      if (spotUV) {
        doc.text("✓ Spot UV", 25, yPos);
        yPos += 7;
      }
    }
    
    // Pricing Section
    yPos += 10;
    doc.setFillColor(59, 130, 246);
    doc.rect(20, yPos - 6, 170, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("PRICING", 25, yPos);
    
    doc.setTextColor(0, 0, 0);
    yPos += 15;
    
    // Price Table
    doc.setFont("helvetica", "normal");
    doc.text("Price per bag:", 25, yPos);
    doc.setFont("helvetica", "bold");
    doc.text(`₹${perBagPrice.toFixed(2)}`, 160, yPos, { align: "right" });
    
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Total Price:", 25, yPos);
    doc.setTextColor(59, 130, 246);
    doc.text(`₹${totalPrice.toFixed(2)}`, 160, yPos, { align: "right" });
    
    // Footer
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("This is a computer-generated quotation.", 105, 280, { align: "center" });
    doc.text("Thank you for your business!", 105, 286, { align: "center" });
    
    doc.save(`Paper_Bag_Quotation_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Quotation PDF downloaded successfully!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Paper Bag Price Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Select value={quantity} onValueChange={setQuantity}>
                <SelectTrigger id="quantity">
                  <SelectValue placeholder="Select quantity" />
                </SelectTrigger>
                <SelectContent>
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
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (inches)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="e.g., 8.5"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gusset">Gusset (inches)</Label>
              <Input
                id="gusset"
                type="number"
                step="0.1"
                placeholder="e.g., 3.35"
                value={gusset}
                onChange={(e) => setGusset(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paperGSM">Paper GSM</Label>
              <Select value={paperGSM} onValueChange={setPaperGSM}>
                <SelectTrigger id="paperGSM">
                  <SelectValue placeholder="Select GSM" />
                </SelectTrigger>
                <SelectContent>
                  {gsmOptions.map((gsm) => (
                    <SelectItem key={gsm} value={gsm}>
                      {gsm} GSM
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Additional Treatments</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="foiling"
                  checked={foiling}
                  onCheckedChange={(checked) => setFoiling(checked as boolean)}
                />
                <label htmlFor="foiling" className="text-sm cursor-pointer">
                  Foiling
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="spotUV"
                  checked={spotUV}
                  onCheckedChange={(checked) => setSpotUV(checked as boolean)}
                />
                <label htmlFor="spotUV" className="text-sm cursor-pointer">
                  Spot UV
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-card)] border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Price Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-lg">
            <span className="text-muted-foreground">Price per bag:</span>
            <span className="font-semibold">₹{perBagPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-2xl pt-4 border-t">
            <span className="font-bold">Total Price:</span>
            <span className="font-bold text-primary">₹{totalPrice.toFixed(2)}</span>
          </div>
          <Button
            onClick={generatePDF}
            className="w-full"
            size="lg"
            disabled={totalPrice === 0}
          >
            <Download className="mr-2 h-5 w-5" />
            Download Quotation PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
