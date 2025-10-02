import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Box, Ruler, Layers, IndianRupee, FileText, Sparkles, Package, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import jsPDF from 'jspdf';

interface CalculatorProps {
  pricing: {
    boardPrices: { [key: string]: number };
    paperPrices: { [key: string]: number };
    printingBase: number;
    foilingBase: number;
    embossingBase: number;
    spotUVBase: number;
  };
}

export const Calculator = ({ pricing }: CalculatorProps) => {
  const [length, setLength] = useState(12);
  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(3);
  const [quantity, setQuantity] = useState(300);
  const [boardThickness, setBoardThickness] = useState("2.4mm");
  const [paperType, setPaperType] = useState("matt lam");
  const [includeFoiling, setIncludeFoiling] = useState(false);
  const [includeEmbossing, setIncludeEmbossing] = useState(false);
  const [includeSpotUV, setIncludeSpotUV] = useState(false);

  const [results, setResults] = useState({
    boardFlatLength: 0,
    boardFlatWidth: 0,
    boardUPS: 0,
    boardQty: 0,
    totalBoardPrice: 0,
    paperFlatLength: 0,
    paperFlatWidth: 0,
    paperUPS: 0,
    paperSheetsNeeded: 0,
    totalPaperPrice: 0,
    printingCost: 0,
    foilingCost: 0,
    embossingCost: 0,
    spotUVCost: 0,
    boxMakingCost: 0,
    totalPrice: 0,
    perBoxPrice: 0,
  });

  useEffect(() => {
    calculatePrice();
  }, [length, width, height, quantity, boardThickness, paperType, includeFoiling, includeEmbossing, includeSpotUV, pricing]);

  const calculatePrice = () => {
    // RIGID BOX CALCULATIONS - Based on provided Excel formulas
    
    // Board flat dimensions calculation (Length + Height*2, Width + Height*2)
    const boardFlatLength = length + (height * 2);
    const boardFlatWidth = width + (height * 2);

    // Calculate board UPS (units per sheet) - standard board sheet 31×41 inches
    // Formula: MAX(INT(31/boardFlatLength)*INT(41/boardFlatWidth), INT(31/boardFlatWidth)*INT(41/boardFlatLength))
    const boardSheetLength = 31;
    const boardSheetWidth = 41;
    const boardUPS = Math.max(
      Math.floor(boardSheetLength / boardFlatLength) * Math.floor(boardSheetWidth / boardFlatWidth),
      Math.floor(boardSheetLength / boardFlatWidth) * Math.floor(boardSheetWidth / boardFlatLength)
    );

    // Calculate board quantity needed - Formula: CEILING(quantity/boardUPS*2)+15
    const boardQty = Math.ceil((quantity / boardUPS) * 2) + 15;

    // Get board price per sheet based on thickness
    const getBoardPrice = (thickness: string) => {
      switch (thickness) {
        case "1.7mm": return 42;
        case "1.9mm": return 50;
        case "2.4mm": return 60;
        case "2.9mm": return 73;
        default: return 60;
      }
    };
    const boardPricePerSheet = getBoardPrice(boardThickness);
    const totalBoardPrice = boardQty * boardPricePerSheet;

    // Paper calculations (add 3 inches to each dimension for wrapping)
    const paperFlatLength = boardFlatLength + 3;
    const paperFlatWidth = boardFlatWidth + 3;

    // Calculate paper UPS - standard paper sheet 28×40 inches
    // Formula: MAX(INT(28/paperFlatLength)*INT(40/paperFlatWidth), INT(28/paperFlatWidth)*INT(40/paperFlatLength))
    const paperSheetLength = 28;
    const paperSheetWidth = 40;
    const paperUPS = Math.max(
      Math.floor(paperSheetLength / paperFlatLength) * Math.floor(paperSheetWidth / paperFlatWidth),
      Math.floor(paperSheetLength / paperFlatWidth) * Math.floor(paperSheetWidth / paperFlatLength)
    );

    // Calculate paper sheets needed - Formula: CEILING(quantity/paperUPS*2.5)+100
    const paperSheetsNeeded = Math.ceil((quantity / paperUPS) * 2.5) + 100;

    // Get paper price per sheet based on type
    const getPaperPrice = (type: string) => {
      switch (type) {
        case "matt lam": return 14;
        case "canvas": return 52;
        case "color council": return 30;
        case "keycolour": return 60;
        case "plike": return 145;
        case "suede": return 180;
        default: return 14;
      }
    };
    const paperPricePerSheet = getPaperPrice(paperType);
    const totalPaperPrice = paperSheetsNeeded * paperPricePerSheet;

    // Printing cost calculation based on paper sheets
    const getPrintingCost = (sheets: number) => {
      if (sheets <= 1000) return 3000;
      if (sheets <= 2000) return 4000;
      if (sheets <= 3000) return 5000;
      return sheets * 1.5;
    };
    const printingCost = getPrintingCost(paperSheetsNeeded);

    // Foiling cost calculation
    const getFoilingCost = (sheets: number) => {
      if (sheets <= 1000) return 10000;
      if (sheets <= 2000) return 16000;
      return 1000 * 6;
    };
    const foilingCost = includeFoiling ? getFoilingCost(paperSheetsNeeded) : 0;

    // Embossing cost calculation
    const getEmbossingCost = (sheets: number) => {
      if (sheets <= 1000) return 15000;
      if (sheets <= 2000) return 20000;
      return 1000 * 8;
    };
    const embossingCost = includeEmbossing ? getEmbossingCost(paperSheetsNeeded) : 0;

    // Spot UV cost calculation
    const getSpotUVCost = (sheets: number) => {
      if (sheets <= 1000) return 12000;
      if (sheets <= 2000) return 15000;
      return 1000 * 6;
    };
    const spotUVCost = includeSpotUV ? getSpotUVCost(paperSheetsNeeded) : 0;

    // Box making cost calculation based on maximum dimension
    // Formula: IF(MAX(length,width)<8,40, IF(MAX(length,width)<10,50, IF(MAX(length,width)<12,60, IF(MAX(length,width)<14,75, IF(MAX(length,width)<20,100)))))*quantity
    const getBoxMakingCost = (maxDimension: number, qty: number) => {
      let costPerBox = 100; // default for >20
      if (maxDimension < 8) costPerBox = 40;
      else if (maxDimension < 10) costPerBox = 50;
      else if (maxDimension < 12) costPerBox = 60;
      else if (maxDimension < 14) costPerBox = 75;
      else if (maxDimension < 20) costPerBox = 100;
      
      return costPerBox * qty;
    };
    const maxDimension = Math.max(length, width);
    const boxMakingCost = getBoxMakingCost(maxDimension, quantity);

    // Total calculation - Formula: (totalBoardPrice + totalPaperPrice + printingCost + foilingCost + embossingCost + spotUVCost + boxMakingCost) * 2
    const subtotal = totalBoardPrice + totalPaperPrice + printingCost + foilingCost + embossingCost + spotUVCost + boxMakingCost;
    const totalPrice = subtotal * 2; // Rigid boxes require double the processing cost
    const perBoxPrice = totalPrice / quantity;

    setResults({
      boardFlatLength,
      boardFlatWidth,
      boardUPS,
      boardQty,
      totalBoardPrice,
      paperFlatLength,
      paperFlatWidth,
      paperUPS,
      paperSheetsNeeded,
      totalPaperPrice,
      printingCost,
      foilingCost,
      embossingCost,
      spotUVCost,
      boxMakingCost,
      totalPrice,
      perBoxPrice,
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header with better formatting
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text('BOX PACKAGING QUOTATION', 20, 30);
    
    // Date and reference
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const today = new Date();
    doc.text(`Generated on: ${today.toLocaleDateString('en-IN')}`, 20, 45);
    doc.text(`Quote Ref: BX-${today.getTime().toString().slice(-6)}`, 20, 55);
    doc.text(`Customer: Professional Client`, 20, 65);
    
    // Specifications section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('BOX SPECIFICATIONS:', 20, 85);
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Dimensions:`, 30, 100);
    doc.text(`${length}" x ${width}" x ${height}"`, 120, 100);
    
    doc.text(`Quantity:`, 30, 115);
    doc.text(`${quantity.toLocaleString('en-IN')} boxes`, 120, 115);
    
    doc.text(`Board Thickness:`, 30, 130);
    doc.text(`${boardThickness}`, 120, 130);
    
    doc.text(`Paper Type:`, 30, 145);
    doc.text(`${paperType}`, 120, 145);
    
    doc.text(`Board Flat Size:`, 30, 160);
    doc.text(`${results.boardFlatLength}" x ${results.boardFlatWidth}"`, 120, 160);
    
    doc.text(`Boxes per Sheet:`, 30, 175);
    doc.text(`${results.boardUPS}`, 120, 175);
    
    doc.text(`Board Sheets Needed:`, 30, 190);
    doc.text(`${results.boardQty}`, 120, 190);
    
    doc.text(`Paper Sheets Needed:`, 30, 205);
    doc.text(`${results.paperSheetsNeeded}`, 120, 205);
    
    // Cost Breakdown section
    let yPos = 225;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('COST BREAKDOWN:', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Board Cost:`, 30, yPos);
    doc.text(`Rs. ${results.totalBoardPrice.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 12;
    
    doc.text(`Paper Cost:`, 30, yPos);
    doc.text(`Rs. ${results.totalPaperPrice.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 12;
    
    doc.text(`Printing Cost:`, 30, yPos);
    doc.text(`Rs. ${results.printingCost.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 12;
    
    if (includeFoiling) {
      doc.text(`Foiling Cost:`, 30, yPos);
      doc.text(`Rs. ${results.foilingCost.toLocaleString('en-IN')}`, 120, yPos);
      yPos += 12;
    }
    
    if (includeEmbossing) {
      doc.text(`Embossing Cost:`, 30, yPos);
      doc.text(`Rs. ${results.embossingCost.toLocaleString('en-IN')}`, 120, yPos);
      yPos += 12;
    }
    
    if (includeSpotUV) {
      doc.text(`Spot UV Cost:`, 30, yPos);
      doc.text(`Rs. ${results.spotUVCost.toLocaleString('en-IN')}`, 120, yPos);
      yPos += 12;
    }
    
    doc.text(`Box Making Cost:`, 30, yPos);
    doc.text(`Rs. ${results.boxMakingCost.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 12;
    
    // Draw a line before total
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos + 5, 190, yPos + 5);
    yPos += 15;
    
    // Total Cost
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 204);
    doc.text('TOTAL COST:', 20, yPos);
    doc.text(`Rs. ${results.totalPrice.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 20;
    
    // Selling Price (same as total for boxes since no markup specified)
    doc.setFontSize(16);
    doc.setTextColor(0, 150, 0);
    doc.text('SELLING PRICE:', 20, yPos);
    doc.text(`Rs. ${results.totalPrice.toLocaleString('en-IN')}`, 120, yPos);
    yPos += 20;
    
    // Per box cost
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Per Box Price:', 20, yPos);
    doc.text(`Rs. ${results.perBoxPrice.toFixed(2)}`, 120, yPos);
    
    // Footer with better formatting
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer generated quotation. All prices are in Indian Rupees.', 20, 280);
    doc.text('Valid for 30 days from the date of generation.', 20, 290);
    
    // Save the PDF
    doc.save(`Box-Quote-${today.toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input Section */}
      <div className="space-y-6">
        <Card className="shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-accent" />
              Box Dimensions
            </CardTitle>
            <CardDescription>Enter the dimensions in inches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length" className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  Length
                </Label>
                <Input
                  id="length"
                  type="number"
                  value={length === 0 ? '' : length}
                  onChange={(e) => setLength(e.target.value === '' ? 0 : Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  min="1"
                  step="0.25"
                  placeholder="Enter length"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width" className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  Width
                </Label>
                <Input
                  id="width"
                  type="number"
                  value={width === 0 ? '' : width}
                  onChange={(e) => setWidth(e.target.value === '' ? 0 : Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  min="1"
                  step="0.25"
                  placeholder="Enter width"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height" className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  Height
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={height === 0 ? '' : height}
                  onChange={(e) => setHeight(e.target.value === '' ? 0 : Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  min="1"
                  step="0.25"
                  placeholder="Enter height"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity" className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                Quantity
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
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-accent" />
              Materials
            </CardTitle>
            <CardDescription>Select board thickness and paper type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="boardThickness">Board Thickness</Label>
              <Select value={boardThickness} onValueChange={setBoardThickness}>
                <SelectTrigger id="boardThickness">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.7mm">1.7mm (Light)</SelectItem>
                  <SelectItem value="1.9mm">1.9mm (Standard)</SelectItem>
                  <SelectItem value="2.4mm">2.4mm (Premium)</SelectItem>
                  <SelectItem value="2.9mm">2.9mm (Luxury)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paperType">Paper Type</Label>
              <Select value={paperType} onValueChange={setPaperType}>
                <SelectTrigger id="paperType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matt lam">Matt Lamination</SelectItem>
                  <SelectItem value="canvas">Canvas</SelectItem>
                  <SelectItem value="color council">Color Council</SelectItem>
                  <SelectItem value="plike">Plike</SelectItem>
                  <SelectItem value="suede">Suede</SelectItem>
                  <SelectItem value="keycolour">Key Colour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Additional Finishes
            </CardTitle>
            <CardDescription>Optional premium finishes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="foiling"
                checked={includeFoiling}
                onCheckedChange={(checked) => setIncludeFoiling(checked as boolean)}
              />
              <Label htmlFor="foiling" className="cursor-pointer">
                Foiling (+₹{pricing.foilingBase})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="embossing"
                checked={includeEmbossing}
                onCheckedChange={(checked) => setIncludeEmbossing(checked as boolean)}
              />
              <Label htmlFor="embossing" className="cursor-pointer">
                Embossing (+₹{pricing.embossingBase})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="spotUV"
                checked={includeSpotUV}
                onCheckedChange={(checked) => setIncludeSpotUV(checked as boolean)}
              />
              <Label htmlFor="spotUV" className="cursor-pointer">
                Spot UV (+₹{pricing.spotUVBase})
              </Label>
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
                <span className="text-muted-foreground">Board ({results.boardQty} sheets)</span>
                <span className="font-medium">₹{results.totalBoardPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Paper ({results.paperSheetsNeeded} sheets)</span>
                <span className="font-medium">₹{results.totalPaperPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Printing</span>
                <span className="font-medium">₹{results.printingCost.toFixed(2)}</span>
              </div>
              {includeFoiling && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Foiling</span>
                  <span className="font-medium">₹{results.foilingCost.toFixed(2)}</span>
                </div>
              )}
              {includeEmbossing && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Embossing</span>
                  <span className="font-medium">₹{results.embossingCost.toFixed(2)}</span>
                </div>
              )}
              {includeSpotUV && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Spot UV</span>
                  <span className="font-medium">₹{results.spotUVCost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Box Making</span>
                <span className="font-medium">₹{results.boxMakingCost.toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Total Price</span>
                <span className="font-bold text-accent">₹{results.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-2xl">
                <span className="font-semibold">Price per Box</span>
                <span className="font-bold text-accent">₹{results.perBoxPrice.toFixed(2)}</span>
              </div>
              
              {/* PDF Download Button */}
              <div className="pt-4 border-t">
                <Button 
                  onClick={generatePDF}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:scale-105"
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
              Technical Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Board Specifications</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flat Board Size:</span>
                    <span className="font-medium">{results.boardFlatLength}" × {results.boardFlatWidth}"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Board UPS:</span>
                    <span className="font-medium">{results.boardUPS} boxes/sheet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Board Sheets Required:</span>
                    <span className="font-medium">{results.boardQty} sheets</span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-blue-600 mb-2">Paper Specifications</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paper Flat Size:</span>
                    <span className="font-medium">{results.paperFlatLength}" × {results.paperFlatWidth}"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paper UPS:</span>
                    <span className="font-medium">{results.paperUPS} pieces/sheet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paper Sheets Required:</span>
                    <span className="font-medium">{results.paperSheetsNeeded} sheets</span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-accent/10 rounded-lg">
                <h4 className="font-semibold text-accent mb-2">Production Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Dimension:</span>
                    <span className="font-medium">{Math.max(length, width)}"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Box Type:</span>
                    <span className="font-medium">Rigid Box</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Complexity Factor:</span>
                    <span className="font-medium">2x (Premium)</span>
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
