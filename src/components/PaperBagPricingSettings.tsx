import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface PaperBagPricing {
  baseData: any[];
  treatments: {
    foiling: number;
    spotUV: number;
  };
}

interface PaperBagPricingSettingsProps {
  pricing: PaperBagPricing;
  onUpdate: (pricing: PaperBagPricing) => void;
}

export const PaperBagPricingSettings = ({ pricing, onUpdate }: PaperBagPricingSettingsProps) => {
  const handleTreatmentChange = (treatment: keyof typeof pricing.treatments, value: string) => {
    const numValue = parseFloat(value) || 0;
    onUpdate({
      ...pricing,
      treatments: {
        ...pricing.treatments,
        [treatment]: numValue,
      },
    });
  };

  const handleSave = () => {
    toast.success("Paper bag pricing settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Treatment Base Costs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="foiling">Foiling (₹)</Label>
            <Input
              id="foiling"
              type="number"
              value={pricing.treatments.foiling}
              onChange={(e) => handleTreatmentChange("foiling", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spotUV">Spot UV (₹)</Label>
            <Input
              id="spotUV"
              type="number"
              value={pricing.treatments.spotUV}
              onChange={(e) => handleTreatmentChange("spotUV", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleSave} className="w-full md:w-auto">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <div className="rounded-lg border border-border/50 p-4 bg-muted/20">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> The base pricing data is pre-loaded from the Excel file. 
          You can adjust treatment costs here. The calculator will use the closest match 
          from the pricing table based on dimensions and quantity.
        </p>
      </div>
    </div>
  );
};
