import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings2, Save } from "lucide-react";
import { toast } from "sonner";

interface BoxPricingSettingsProps {
  pricing: {
    boardPrices: { [key: string]: number };
    paperPrices: { [key: string]: number };
    printingBase: number;
    foilingBase: number;
    embossingBase: number;
    spotUVBase: number;
  };
  onUpdate: (newPricing: any) => void;
}

export const BoxPricingSettings = ({ pricing, onUpdate }: BoxPricingSettingsProps) => {
  const [localPricing, setLocalPricing] = useState(pricing);

  const handleSave = () => {
    onUpdate(localPricing);
    toast.success("Box pricing updated successfully!");
  };

  const updateBoardPrice = (thickness: string, value: number) => {
    setLocalPricing({
      ...localPricing,
      boardPrices: { ...localPricing.boardPrices, [thickness]: value },
    });
  };

  const updatePaperPrice = (type: string, value: number) => {
    setLocalPricing({
      ...localPricing,
      paperPrices: { ...localPricing.paperPrices, [type]: value },
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-accent" />
            Board Prices (per sheet)
          </CardTitle>
          <CardDescription>Adjust the cost for each board thickness</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(localPricing.boardPrices).map(([thickness, price]) => (
              <div key={thickness} className="space-y-2">
                <Label htmlFor={`board-${thickness}`}>{thickness}</Label>
                <Input
                  id={`board-${thickness}`}
                  type="number"
                  value={price}
                  onChange={(e) => updateBoardPrice(thickness, Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-accent" />
            Paper Prices (per sheet)
          </CardTitle>
          <CardDescription>Adjust the cost for each paper type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(localPricing.paperPrices).map(([type, price]) => (
              <div key={type} className="space-y-2">
                <Label htmlFor={`paper-${type}`} className="capitalize">{type}</Label>
                <Input
                  id={`paper-${type}`}
                  type="number"
                  value={price}
                  onChange={(e) => updatePaperPrice(type, Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-accent" />
            Base Costs
          </CardTitle>
          <CardDescription>Adjust the flat rates for printing and finishes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="printing">Printing Base (₹)</Label>
              <Input
                id="printing"
                type="number"
                value={localPricing.printingBase}
                onChange={(e) => setLocalPricing({ ...localPricing, printingBase: Number(e.target.value) })}
                min="0"
                step="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foiling">Foiling Base (₹)</Label>
              <Input
                id="foiling"
                type="number"
                value={localPricing.foilingBase}
                onChange={(e) => setLocalPricing({ ...localPricing, foilingBase: Number(e.target.value) })}
                min="0"
                step="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="embossing">Embossing Base (₹)</Label>
              <Input
                id="embossing"
                type="number"
                value={localPricing.embossingBase}
                onChange={(e) => setLocalPricing({ ...localPricing, embossingBase: Number(e.target.value) })}
                min="0"
                step="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spotUV">Spot UV Base (₹)</Label>
              <Input
                id="spotUV"
                type="number"
                value={localPricing.spotUVBase}
                onChange={(e) => setLocalPricing({ ...localPricing, spotUVBase: Number(e.target.value) })}
                min="0"
                step="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full" size="lg">
        <Save className="mr-2 h-4 w-4" />
        Save Box Pricing Settings
      </Button>
    </div>
  );
};
