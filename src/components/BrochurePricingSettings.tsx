import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings2, Save } from "lucide-react";
import { toast } from "sonner";

interface BrochurePricingSettingsProps {
  pricing: {
    paperGSMPrices: { [key: string]: number };
    printingBase: number;
    laminationBase: number;
    dieCuttingBase: number;
    packingBase: number;
    foilingBase: number;
    spotUVBase: number;
    embossingBase: number;
    pocketBase: number;
  };
  onUpdate: (newPricing: any) => void;
}

export const BrochurePricingSettings = ({ pricing, onUpdate }: BrochurePricingSettingsProps) => {
  const [localPricing, setLocalPricing] = useState(pricing);

  const handleSave = () => {
    onUpdate(localPricing);
    toast.success("Brochure pricing updated successfully!");
  };

  const updatePaperGSMPrice = (gsm: string, value: number) => {
    setLocalPricing({
      ...localPricing,
      paperGSMPrices: { ...localPricing.paperGSMPrices, [gsm]: value },
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-accent" />
            Paper GSM Prices (per sheet)
          </CardTitle>
          <CardDescription>Adjust the cost for each paper GSM weight</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(localPricing.paperGSMPrices).map(([gsm, price]) => (
              <div key={gsm} className="space-y-2">
                <Label htmlFor={`gsm-${gsm}`}>{gsm} GSM</Label>
                <Input
                  id={`gsm-${gsm}`}
                  type="number"
                  value={price}
                  onChange={(e) => updatePaperGSMPrice(gsm, Number(e.target.value))}
                  min="0"
                  step="1"
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
          <CardDescription>Adjust flat rates for printing and finishes</CardDescription>
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
              <Label htmlFor="lamination">Lamination Base (₹)</Label>
              <Input
                id="lamination"
                type="number"
                value={localPricing.laminationBase}
                onChange={(e) => setLocalPricing({ ...localPricing, laminationBase: Number(e.target.value) })}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dieCutting">Die Cutting Base (₹)</Label>
              <Input
                id="dieCutting"
                type="number"
                value={localPricing.dieCuttingBase}
                onChange={(e) => setLocalPricing({ ...localPricing, dieCuttingBase: Number(e.target.value) })}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="packing">Packing Base (₹)</Label>
              <Input
                id="packing"
                type="number"
                value={localPricing.packingBase}
                onChange={(e) => setLocalPricing({ ...localPricing, packingBase: Number(e.target.value) })}
                min="0"
                step="0.1"
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
              <Label htmlFor="pocket">Pocket Base (₹)</Label>
              <Input
                id="pocket"
                type="number"
                value={localPricing.pocketBase}
                onChange={(e) => setLocalPricing({ ...localPricing, pocketBase: Number(e.target.value) })}
                min="0"
                step="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full" size="lg">
        <Save className="mr-2 h-4 w-4" />
        Save Brochure Pricing Settings
      </Button>
    </div>
  );
};
