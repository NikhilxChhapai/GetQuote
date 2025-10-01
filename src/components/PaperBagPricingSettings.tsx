import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Info } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Paper Bag Types Available:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>SBS 2 Sheets - Standard quality, 270/300 GSM</li>
            <li>SBS 1 Sheet - Economy option, 270/300 GSM</li>
            <li>Keycolor Paper - Premium quality, 250 GSM with special finishes</li>
            <li>Kraft Paper - Eco-friendly, 250 GSM natural look</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Treatment Base Costs</h3>
        <p className="text-sm text-muted-foreground">
          These are default treatment costs. The calculator will adjust based on quantity and paper type.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="foiling">Foiling Base Cost (₹)</Label>
            <Input
              id="foiling"
              type="number"
              value={pricing.treatments.foiling}
              onChange={(e) => handleTreatmentChange("foiling", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Applied to all paper types</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="spotUV">Spot UV Base Cost (₹)</Label>
            <Input
              id="spotUV"
              type="number"
              value={pricing.treatments.spotUV}
              onChange={(e) => handleTreatmentChange("spotUV", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Only for SBS types</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border/50 p-4 bg-muted/20">
        <h4 className="font-semibold mb-2">Pricing Data Source</h4>
        <p className="text-sm text-muted-foreground">
          The calculator uses pre-loaded pricing tables for each paper type with {pricing.baseData.length}+ 
          different size and quantity combinations. The system automatically matches customer specifications 
          with the closest pricing data or calculates estimates for custom sizes.
        </p>
        <div className="mt-3 space-y-1 text-xs">
          <p><strong>Available Quantities:</strong> 60, 100, 200, 250, 300, 500, 800, 1000, 2000, 3000, 5000, 7500</p>
          <p><strong>GSM Options:</strong> 250, 270, 300 (depending on paper type)</p>
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleSave} className="w-full md:w-auto" size="lg">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};
