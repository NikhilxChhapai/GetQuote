import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings2, Save, Sparkles, Printer } from "lucide-react";
import { toast } from "sonner";

interface BusinessCardPricingSettingsProps {
  pricing: {
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
  };
  onUpdate: (newPricing: any) => void;
}

export const BusinessCardPricingSettings = ({ pricing, onUpdate }: BusinessCardPricingSettingsProps) => {
  const [localPricing, setLocalPricing] = useState(pricing);

  const handleSave = () => {
    onUpdate(localPricing);
    toast.success("Digital printing pricing updated successfully!");
  };

  const updateTreatmentPrice = (treatment: string, value: number) => {
    setLocalPricing({
      ...localPricing,
      treatments: { ...localPricing.treatments, [treatment]: value },
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-purple-600" />
            Digital Print Treatment Costs
          </CardTitle>
          <CardDescription>Adjust the cost for premium digital printing treatments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="foilingDigital">Foiling Digital (₹)</Label>
              <Input
                id="foilingDigital"
                type="number"
                value={localPricing.treatments.foilingDigital}
                onChange={(e) => updateTreatmentPrice("foilingDigital", Number(e.target.value))}
                min="0"
                step="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="raisedUV">Raised UV (₹)</Label>
              <Input
                id="raisedUV"
                type="number"
                value={localPricing.treatments.raisedUV}
                onChange={(e) => updateTreatmentPrice("raisedUV", Number(e.target.value))}
                min="0"
                step="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foilpress">Foilpress (₹)</Label>
              <Input
                id="foilpress"
                type="number"
                value={localPricing.treatments.foilpress}
                onChange={(e) => updateTreatmentPrice("foilpress", Number(e.target.value))}
                min="0"
                step="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="letterpress">Letterpress (₹)</Label>
              <Input
                id="letterpress"
                type="number"
                value={localPricing.treatments.letterpress}
                onChange={(e) => updateTreatmentPrice("letterpress", Number(e.target.value))}
                min="0"
                step="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="embossing">Embossing (₹)</Label>
              <Input
                id="embossing"
                type="number"
                value={localPricing.treatments.embossing}
                onChange={(e) => updateTreatmentPrice("embossing", Number(e.target.value))}
                min="0"
                step="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="electroplating">Electroplating (₹)</Label>
              <Input
                id="electroplating"
                type="number"
                value={localPricing.treatments.electroplating}
                onChange={(e) => updateTreatmentPrice("electroplating", Number(e.target.value))}
                min="0"
                step="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edgepaint">Edge Paint (₹)</Label>
              <Input
                id="edgepaint"
                type="number"
                value={localPricing.treatments.edgepaint}
                onChange={(e) => updateTreatmentPrice("edgepaint", Number(e.target.value))}
                min="0"
                step="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edgeGilding">Edge Gilding (₹)</Label>
              <Input
                id="edgeGilding"
                type="number"
                value={localPricing.treatments.edgeGilding}
                onChange={(e) => updateTreatmentPrice("edgeGilding", Number(e.target.value))}
                min="0"
                step="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="laserCutting">Laser Cutting (₹)</Label>
              <Input
                id="laserCutting"
                type="number"
                value={localPricing.treatments.laserCutting}
                onChange={(e) => updateTreatmentPrice("laserCutting", Number(e.target.value))}
                min="0"
                step="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stickerCutting">Sticker Cutting (₹)</Label>
              <Input
                id="stickerCutting"
                type="number"
                value={localPricing.treatments.stickerCutting}
                onChange={(e) => updateTreatmentPrice("stickerCutting", Number(e.target.value))}
                min="0"
                step="10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-accent" />
            Paper Type Pricing
          </CardTitle>
          <CardDescription>Paper prices are tiered by quantity. Edit in advanced settings if needed.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Paper type pricing uses a tiered structure based on quantity (100, 250, 500, 1000, etc.). 
            Contact support for detailed paper pricing adjustments.
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full" size="lg">
        <Save className="mr-2 h-4 w-4" />
        Save Digital Printing Settings
      </Button>
    </div>
  );
};
