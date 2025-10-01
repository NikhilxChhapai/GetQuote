import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Box, Ruler, Layers, IndianRupee, FileText, Sparkles, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
    paperSheetsNeeded: 0,
    totalPaperPrice: 0,
    printingCost: 0,
    foilingCost: 0,
    embossingCost: 0,
    spotUVCost: 0,
    totalPrice: 0,
    perBoxPrice: 0,
  });

  useEffect(() => {
    calculatePrice();
  }, [length, width, height, quantity, boardThickness, paperType, includeFoiling, includeEmbossing, includeSpotUV, pricing]);

  const calculatePrice = () => {
    // Board flat dimensions (add height × 2 for folding)
    const boardFlatLength = length + height * 2;
    const boardFlatWidth = width + height * 2;

    // Calculate board UPS (units per sheet) - standard sheet 42×60 inches
    const sheetArea = 42 * 60;
    const boxArea = boardFlatLength * boardFlatWidth;
    const boardUPS = Math.floor(sheetArea / boxArea);

    // Board quantity needed
    const boardQty = Math.ceil(quantity / boardUPS);

    // Board price
    const boardPricePerSheet = pricing.boardPrices[boardThickness] || 60;
    const totalBoardPrice = boardQty * boardPricePerSheet;

    // Paper sheets calculation (typically 2.5 sheets per box for wrapping)
    const paperSheetsNeeded = Math.ceil(quantity * 2.5);
    const paperPricePerSheet = pricing.paperPrices[paperType] || 14;
    const totalPaperPrice = paperSheetsNeeded * paperPricePerSheet;

    // Additional costs
    const printingCost = pricing.printingBase;
    const foilingCost = includeFoiling ? pricing.foilingBase : 0;
    const embossingCost = includeEmbossing ? pricing.embossingBase : 0;
    const spotUVCost = includeSpotUV ? pricing.spotUVBase : 0;

    // Total calculation
    const totalPrice = totalBoardPrice + totalPaperPrice + printingCost + foilingCost + embossingCost + spotUVCost;
    const perBoxPrice = totalPrice / quantity;

    setResults({
      boardFlatLength,
      boardFlatWidth,
      boardUPS,
      boardQty,
      totalBoardPrice,
      paperSheetsNeeded,
      totalPaperPrice,
      printingCost,
      foilingCost,
      embossingCost,
      spotUVCost,
      totalPrice,
      perBoxPrice,
    });
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
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  min="1"
                  step="0.25"
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
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  min="1"
                  step="0.25"
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
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min="1"
                  step="0.25"
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
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
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
            </div>

            <Separator />

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Total Price</span>
                <span className="font-bold text-accent">₹{results.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-2xl">
                <span className="font-semibold">Price per Box</span>
                <span className="font-bold text-accent">₹{results.perBoxPrice.toFixed(2)}</span>
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">Flat Board Size</span>
              <span className="font-medium">{results.boardFlatLength}" × {results.boardFlatWidth}"</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Units per Sheet (UPS)</span>
              <span className="font-medium">{results.boardUPS}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Board Sheets Required</span>
              <span className="font-medium">{results.boardQty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paper Sheets Required</span>
              <span className="font-medium">{results.paperSheetsNeeded}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
