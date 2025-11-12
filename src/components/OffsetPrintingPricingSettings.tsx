import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Settings2, Save } from "lucide-react";
import { toast } from "sonner";
import { OffsetPrintingSettings } from "@/types/offset";

interface OffsetPrintingPricingSettingsProps {
  settings: OffsetPrintingSettings;
  onUpdate: (next: OffsetPrintingSettings) => void;
}

export const OffsetPrintingPricingSettings = ({
  settings,
  onUpdate,
}: OffsetPrintingPricingSettingsProps) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const updateSettings = (updater: (current: OffsetPrintingSettings) => OffsetPrintingSettings) => {
    setLocalSettings((prev) => {
      const draft = JSON.parse(JSON.stringify(prev)) as OffsetPrintingSettings;
      return updater(draft);
    });
  };

  const handleSave = () => {
    onUpdate(localSettings);
    toast.success("Offset printing settings updated!");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-lg border bg-muted/40 p-5">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-accent" />
          <div>
            <p className="text-base font-semibold">Paper Profiles</p>
            <p className="text-sm text-muted-foreground">
              Configure default GSM and bundle pricing for quick selections.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {localSettings.paperProfiles.map((profile, index) => (
            <div key={profile.id} className="space-y-3 rounded-md border bg-background p-4">
              <div className="space-y-2">
                <Label htmlFor={`profile-name-${profile.id}`}>Display Name</Label>
                <Input
                  id={`profile-name-${profile.id}`}
                  value={profile.name}
                  onChange={(event) => {
                    const value = event.target.value;
                    updateSettings((current) => {
                      current.paperProfiles[index].name = value;
                      return current;
                    });
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`profile-gsm-${profile.id}`}>Default GSM</Label>
                  <Input
                    id={`profile-gsm-${profile.id}`}
                    type="number"
                    min="0"
                    value={profile.defaultGSM}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      updateSettings((current) => {
                        current.paperProfiles[index].defaultGSM = value;
                        return current;
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`profile-price-${profile.id}`}>Price (₹/500)</Label>
                  <Input
                    id={`profile-price-${profile.id}`}
                    type="number"
                    min="0"
                    step="10"
                    value={profile.pricePer500}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      updateSettings((current) => {
                        current.paperProfiles[index].pricePer500 = value;
                        return current;
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-muted/40 p-5">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-accent" />
          <div>
            <p className="text-base font-semibold">Flat Sheet Options</p>
            <p className="text-sm text-muted-foreground">
              Adjust sheet sizes used for UPS calculations.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {localSettings.sheetOptions.map((option, index) => (
            <div key={option.id} className="space-y-3 rounded-md border bg-background p-4">
              <div className="space-y-2">
                <Label htmlFor={`sheet-label-${option.id}`}>Label</Label>
                <Input
                  id={`sheet-label-${option.id}`}
                  value={option.label}
                  onChange={(event) => {
                    const value = event.target.value;
                    updateSettings((current) => {
                      current.sheetOptions[index].label = value;
                      return current;
                    });
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`sheet-width-${option.id}`}>Width (cm)</Label>
                  <Input
                    id={`sheet-width-${option.id}`}
                    type="number"
                    min="0"
                    step="0.1"
                    value={option.width}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      updateSettings((current) => {
                        current.sheetOptions[index].width = value;
                        return current;
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`sheet-height-${option.id}`}>Height (cm)</Label>
                  <Input
                    id={`sheet-height-${option.id}`}
                    type="number"
                    min="0"
                    step="0.1"
                    value={option.height}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      updateSettings((current) => {
                        current.sheetOptions[index].height = value;
                        return current;
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-muted/40 p-5">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-accent" />
          <div>
            <p className="text-base font-semibold">Printing Slabs</p>
            <p className="text-sm text-muted-foreground">
              Tiered pricing for sheet quantities. Values are for single side; both sides use multiplier.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(localSettings.printingSlabs)
            .map(([threshold, price]) => ({ threshold: Number(threshold), price }))
            .sort((a, b) => a.threshold - b.threshold)
            .map(({ threshold, price }) => (
              <div key={threshold} className="space-y-2 rounded-md border bg-background p-4">
                <Label htmlFor={`slab-${threshold}`}>{threshold.toLocaleString()} sheets</Label>
                <Input
                  id={`slab-${threshold}`}
                  type="number"
                  min="0"
                  step="100"
                  value={price}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    updateSettings((current) => {
                      current.printingSlabs[threshold] = value;
                      return current;
                    });
                  }}
                />
              </div>
            ))}
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="per-sheet-above">Per-sheet above max (₹)</Label>
            <Input
              id="per-sheet-above"
              type="number"
              min="0"
              step="0.1"
              value={localSettings.perSheetAboveMax}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSettings((current) => {
                  current.perSheetAboveMax = value;
                  return current;
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="double-sided-multiplier">Double-sided multiplier</Label>
            <Input
              id="double-sided-multiplier"
              type="number"
              min="0"
              step="0.1"
              value={localSettings.doubleSidedMultiplier}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSettings((current) => {
                  current.doubleSidedMultiplier = value;
                  return current;
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="safety-sheets">Safety sheets</Label>
            <Input
              id="safety-sheets"
              type="number"
              min="0"
              step="1"
              value={localSettings.safetySheets}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSettings((current) => {
                  current.safetySheets = value;
                  return current;
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="markup-multiplier">Markup multiplier</Label>
            <Input
              id="markup-multiplier"
              type="number"
              min="0"
              step="0.05"
              value={localSettings.markupMultiplier}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSettings((current) => {
                  current.markupMultiplier = value;
                  return current;
                });
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-muted/40 p-5">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-accent" />
          <div>
            <p className="text-base font-semibold">Finishing & Conversion Rates</p>
            <p className="text-sm text-muted-foreground">
              Rates are applied based on quantity toggles in the calculator.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="creasing-per-1000">Creasing (₹ / 1000)</Label>
            <Input
              id="creasing-per-1000"
              type="number"
              min="0"
              step="10"
              value={localSettings.creasingPerThousand}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSettings((current) => {
                  current.creasingPerThousand = value;
                  return current;
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cutting-per-1000">Cutting (₹ / 1000)</Label>
            <Input
              id="cutting-per-1000"
              type="number"
              min="0"
              step="10"
              value={localSettings.cuttingPerThousand}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSettings((current) => {
                  current.cuttingPerThousand = value;
                  return current;
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="packaging-per-1000">Packaging (₹ / 1000)</Label>
            <Input
              id="packaging-per-1000"
              type="number"
              min="0"
              step="10"
              value={localSettings.packagingPerThousand}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSettings((current) => {
                  current.packagingPerThousand = value;
                  return current;
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lamination-per-1000">Lamination (₹ / 1000)</Label>
            <Input
              id="lamination-per-1000"
              type="number"
              min="0"
              step="10"
              value={localSettings.laminationPerThousand}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSettings((current) => {
                  current.laminationPerThousand = value;
                  return current;
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="embossing-per-unit">Embossing (₹ / unit)</Label>
            <Input
              id="embossing-per-unit"
              type="number"
              min="0"
              step="1"
              value={localSettings.embossingPerUnit}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSettings((current) => {
                  current.embossingPerUnit = value;
                  return current;
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="varnish-divisor">Varnish divisor</Label>
            <Input
              id="varnish-divisor"
              type="number"
              min="1"
              step="10"
              value={localSettings.varnishDivisor}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSettings((current) => {
                  current.varnishDivisor = value;
                  return current;
                });
              }}
            />
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="spot-uv-base">Spot UV flat (₹)</Label>
            <Input
              id="spot-uv-base"
              type="number"
              min="0"
              step="100"
              value={localSettings.spotUV.uptoThreshold}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSettings((current) => {
                  current.spotUV.uptoThreshold = value;
                  return current;
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spot-uv-per-sheet">Spot UV per sheet (₹)</Label>
            <Input
              id="spot-uv-per-sheet"
              type="number"
              min="0"
              step="0.1"
              value={localSettings.spotUV.perSheetAbove}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSettings((current) => {
                  current.spotUV.perSheetAbove = value;
                  return current;
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="foiling-threshold">Foiling threshold (qty)</Label>
            <Input
              id="foiling-threshold"
              type="number"
              min="0"
              step="10"
              value={localSettings.foiling.quantityThreshold}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSettings((current) => {
                  current.foiling.quantityThreshold = value;
                  return current;
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="foiling-base">Foiling base (₹)</Label>
            <Input
              id="foiling-base"
              type="number"
              min="0"
              step="100"
              value={localSettings.foiling.baseCost}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSettings((current) => {
                  current.foiling.baseCost = value;
                  return current;
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="foiling-per-unit">Foiling per unit (₹)</Label>
            <Input
              id="foiling-per-unit"
              type="number"
              min="0"
              step="0.5"
              value={localSettings.foiling.perUnitAbove}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSettings((current) => {
                  current.foiling.perUnitAbove = value;
                  return current;
                });
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="mr-2 h-4 w-4" />
          Save Offset Printing Settings
        </Button>
      </div>
    </div>
  );
};


