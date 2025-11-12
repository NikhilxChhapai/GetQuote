import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileSpreadsheet,
  IndianRupee,
  Layers,
  Ruler,
  SlidersHorizontal,
  Sparkles,
  Table as TableIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import {
  OffsetCalculatorInputs,
  OffsetPrintingSettings,
  SheetEvaluation,
} from "@/types/offset";
import { calculateOffsetPrinting } from "@/lib/offsetCalculator";
import jsPDF from "jspdf";
import { SecureCostReveal } from "@/components/SecureCostReveal";

const PAPER_PRICE_MAP: Record<string, number> = {
  Art: 85,
  "Mont Blanc": 250,
  Arte: 210,
  SBS: 75,
  "Natural Evolution": 300,
  "Butter Paper": 500,
};

const resolvePaperPrice = (paperType: string, fallback: number) =>
  PAPER_PRICE_MAP[paperType] ?? fallback;

interface OffsetPrintingCalculatorProps {
  settings: OffsetPrintingSettings;
}

export const OffsetPrintingCalculator = ({ settings }: OffsetPrintingCalculatorProps) => {
  const defaultPaperProfile = settings.paperProfiles[0];
  const defaultSheetOption = settings.sheetOptions[0];
  const machineConfigs = settings.machineConfigs ?? [];
  const defaultMachine = machineConfigs[0];
  const defaultPreset = defaultMachine?.presets[0];

  const defaultProfileMatch = defaultPreset
    ? settings.paperProfiles.find(
        (profile) =>
          profile.id.toLowerCase() === defaultPreset.paperType.toLowerCase() ||
          profile.name.toLowerCase() === defaultPreset.paperType.toLowerCase(),
      )?.id
    : undefined;

  const defaultProductWidthCm = defaultPreset ? parseFloat((defaultPreset.productWidthIn * 2.54).toFixed(2)) : 5;
  const defaultProductHeightCm = defaultPreset ? parseFloat((defaultPreset.productHeightIn * 2.54).toFixed(2)) : 8;
  const defaultQuantity = defaultPreset?.quantity ?? 2000;
  const defaultPaperPrice = defaultPreset
    ? resolvePaperPrice(defaultPreset.paperType, defaultPaperProfile?.pricePer500 ?? 5000)
    : defaultPaperProfile?.pricePer500 ?? 5000;
  const defaultGSM = defaultPreset?.gsm ?? defaultPaperProfile?.defaultGSM ?? 300;
  const defaultPrintingSide = defaultPreset?.printingSide ?? "both";
  const defaultSheetId = defaultPreset
    ? settings.sheetOptions.find(
        (item) =>
          Math.abs(item.width - parseFloat((defaultPreset.sheetWidthIn * 2.54).toFixed(2))) < 0.25 &&
          Math.abs(item.height - parseFloat((defaultPreset.sheetHeightIn * 2.54).toFixed(2))) < 0.25,
      )?.id
    : defaultSheetOption?.id;

  const [selectedMachineId, setSelectedMachineId] = useState(defaultMachine?.id ?? "");
  const [selectedPresetQuantity, setSelectedPresetQuantity] = useState(defaultQuantity);

  const [inputs, setInputs] = useState<OffsetCalculatorInputs>({
    productWidth: defaultProductWidthCm,
    productHeight: defaultProductHeightCm,
    quantity: defaultQuantity,
    selectedPaperProfileId: defaultProfileMatch ?? defaultPaperProfile?.id ?? "custom",
    gsm: defaultGSM,
    paperPricePer500: defaultPaperPrice,
    printingSide: defaultPrintingSide,
    includeLamination: defaultPreset?.includeLamination ?? false,
    includeVarnish: defaultPreset?.includeVarnish ?? false,
    includeSpotUV: defaultPreset?.includeSpotUV ?? false,
    includeFoiling: defaultPreset?.includeFoiling ?? false,
    includeEmbossing: defaultPreset?.includeEmbossing ?? false,
    includeCreasing: defaultPreset?.includeCreasing ?? false,
    includeCutting: true,
    includePackaging: true,
    includeEnvelope: defaultPreset?.includeEnvelope ?? false,
    sheetSelectionMode: defaultSheetId ? "manual" : "auto",
    selectedSheetId: defaultSheetId,
  });

  const [results, setResults] = useState(() =>
    calculateOffsetPrinting(inputs, settings),
  );

  const currentMachine = useMemo(
    () => machineConfigs.find((machine) => machine.id === selectedMachineId),
    [machineConfigs, selectedMachineId],
  );
  const currentPreset = useMemo(
    () => currentMachine?.presets.find((preset) => preset.quantity === selectedPresetQuantity),
    [currentMachine, selectedPresetQuantity],
  );

  useEffect(() => {
    if (!currentMachine || !currentPreset) {
      return;
    }

    const widthCm = parseFloat((currentPreset.productWidthIn * 2.54).toFixed(2));
    const heightCm = parseFloat((currentPreset.productHeightIn * 2.54).toFixed(2));
    const sheetWidthCm = parseFloat((currentPreset.sheetWidthIn * 2.54).toFixed(2));
    const sheetHeightCm = parseFloat((currentPreset.sheetHeightIn * 2.54).toFixed(2));

    const sheetOption = settings.sheetOptions.find(
      (item) => Math.abs(item.width - sheetWidthCm) < 0.25 && Math.abs(item.height - sheetHeightCm) < 0.25,
    );

    const profile = settings.paperProfiles.find(
      (profileItem) => profileItem.id.toLowerCase() === currentPreset.paperType.toLowerCase() || profileItem.name.toLowerCase() === currentPreset.paperType.toLowerCase(),
    );

    setInputs((prev) => ({
      ...prev,
      productWidth: widthCm,
      productHeight: heightCm,
      quantity: currentPreset.quantity,
      gsm: currentPreset.gsm,
      paperPricePer500: resolvePaperPrice(currentPreset.paperType, prev.paperPricePer500),
      printingSide: currentPreset.printingSide,
      includeLamination: currentPreset.includeLamination,
      includeVarnish: currentPreset.includeVarnish,
      includeSpotUV: currentPreset.includeSpotUV,
      includeFoiling: currentPreset.includeFoiling,
      includeEmbossing: currentPreset.includeEmbossing,
      includeCreasing: currentPreset.includeCreasing,
      includeEnvelope: currentPreset.includeEnvelope ?? false,
      includeCutting: true,
      includePackaging: true,
      selectedPaperProfileId: profile?.id ?? prev.selectedPaperProfileId,
      sheetSelectionMode: sheetOption ? "manual" : prev.sheetSelectionMode,
      selectedSheetId: sheetOption?.id ?? prev.selectedSheetId,
    }));
  }, [currentMachine, currentPreset, settings.paperProfiles, settings.sheetOptions]);

  const sheetDescriptions = useMemo(() => {
    const evaluations = results.sheetEvaluations;
    const map = new Map<string, SheetEvaluation>();
    evaluations.forEach((evaluation) => {
      map.set(evaluation.option.id, evaluation);
    });
    return map;
  }, [results.sheetEvaluations]);

  const handleNumberChange = (key: keyof OffsetCalculatorInputs) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    setInputs((prev) => ({
      ...prev,
      [key]: rawValue === "" ? 0 : Number(rawValue),
    }));
  };

  const handlePaperProfileChange = (profileId: string) => {
    const profile = settings.paperProfiles.find((item) => item.id === profileId);
    setInputs((prev) => ({
      ...prev,
      selectedPaperProfileId: profileId,
      gsm: profile?.defaultGSM ?? prev.gsm,
      paperPricePer500: profile?.pricePer500 ?? prev.paperPricePer500,
    }));
  };

  const handleSheetModeChange = (mode: "auto" | "manual") => {
    setInputs((prev) => ({
      ...prev,
      sheetSelectionMode: mode,
      selectedSheetId: mode === "manual" ? (prev.selectedSheetId ?? settings.sheetOptions[0]?.id) : undefined,
    }));
  };

  const handleSheetChange = (sheetId: string) => {
    setInputs((prev) => ({
      ...prev,
      selectedSheetId: sheetId,
    }));
  };

  const handleToggleChange = (key: keyof OffsetCalculatorInputs) => (checked: boolean | string) => {
    setInputs((prev) => ({
      ...prev,
      [key]: Boolean(checked),
    }));
  };

  const handlePrintingSideChange = (value: "single" | "both") => {
    setInputs((prev) => ({
      ...prev,
      printingSide: value,
    }));
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const today = new Date();

    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text("OFFSET PRINTING QUOTATION", 20, 25);

    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Generated on: ${today.toLocaleDateString("en-IN")}`, 20, 35);
    doc.text(`Reference: OF-${today.getTime().toString().slice(-6)}`, 20, 42);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("SPECIFICATIONS", 20, 55);

    let yPos = 63;
    const addRow = (label: string, value: string | number) => {
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`${label}:`, 22, yPos);
      doc.setTextColor(20);
      doc.text(String(value), 90, yPos);
      yPos += 8;
    };

    if (currentMachine) {
      addRow("Machine", currentMachine.label);
    }
    if (currentPreset) {
      addRow("Preset Quantity", currentPreset.quantity.toLocaleString("en-IN"));
    }
    addRow("Product Size (W × H cm)", `${inputs.productWidth} × ${inputs.productHeight}`);
    addRow("Quantity", inputs.quantity.toLocaleString("en-IN"));
    const selectedPaper = settings.paperProfiles.find((item) => item.id === inputs.selectedPaperProfileId);
    addRow("Paper Type", selectedPaper ? selectedPaper.name : inputs.selectedPaperProfileId);
    addRow("GSM", inputs.gsm);
    addRow("Paper Price (₹ / 500)", `₹${inputs.paperPricePer500.toLocaleString("en-IN")}`);
    addRow("Printing Side", inputs.printingSide === "both" ? "Both sides" : "Single side");

    const selectedSheet = results.selectedSheet;
    addRow("Selected Sheet", selectedSheet ? `${selectedSheet.label}` : "No fit");
    addRow("UPS", results.ups);
    addRow("Total Sheets Needed", results.totalSheets);
    addRow("Wastage (pcs)", results.wastagePieces);
    addRow("Wastage %", `${(results.wastagePercent * 100).toFixed(2)}%`);

    yPos += 4;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("COST BREAKDOWN", 20, yPos);
    yPos += 10;

    const currency = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

    const addCostRow = (label: string, value: number) => {
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(label, 22, yPos);
      doc.setTextColor(20);
      doc.text(currency(value), 120, yPos);
      yPos += 7;
    };

    addCostRow("Paper Cost", results.totalPaperCost);
    addCostRow("Printing Cost", results.printingCost);
    if (results.laminationCost > 0) addCostRow("Lamination", results.laminationCost);
    if (results.varnishCost > 0) addCostRow("Varnish", results.varnishCost);
    if (results.spotUVCost > 0) addCostRow("Spot UV", results.spotUVCost);
    if (results.foilingCost > 0) addCostRow("Foiling", results.foilingCost);
    if (results.embossingCost > 0) addCostRow("Embossing", results.embossingCost);
    if (results.creasingCost > 0) addCostRow("Creasing", results.creasingCost);
    if (results.cuttingCost > 0) addCostRow("Cutting", results.cuttingCost);
    if (results.packagingCost > 0) addCostRow("Packaging", results.packagingCost);
    if (results.envelopeCost > 0) {
      addCostRow("Envelope", results.envelopeCost);
    }

    yPos += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    yPos += 8;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Subtotal:", 22, yPos);
    doc.text(currency(results.subtotalCost), 120, yPos);
    yPos += 10;

    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("TOTAL (incl. markup):", 22, yPos);
    doc.text(currency(results.totalCostWithMarkup), 120, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(0, 140, 0);
    doc.text("Per Unit Price:", 22, yPos);
    doc.text(currency(results.perUnitCost), 120, yPos);

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text("Pricing includes current markup multiplier. Taxes extra. Valid for 7 days.", 20, 285);

    doc.save(`Offset-Quote-${today.toISOString().split("T")[0]}.pdf`);
  };

  const selectedSheetEval = inputs.selectedSheetId
    ? sheetDescriptions.get(inputs.selectedSheetId)
    : undefined;

  const handleMachineChange = (machineId: string) => {
    setSelectedMachineId(machineId);
    const machine = machineConfigs.find((item) => item.id === machineId);
    if (machine?.presets.length) {
      setSelectedPresetQuantity(machine.presets[0].quantity);
    }
  };

  const handlePresetChange = (quantityValue: string) => {
    const qty = Number(quantityValue);
    if (!Number.isNaN(qty)) {
      setSelectedPresetQuantity(qty);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card className="shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-accent" />
              Machine Preset
            </CardTitle>
            <CardDescription>Select a press configuration and quantity preset to auto-fill inputs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Machine</Label>
                <Select value={selectedMachineId} onValueChange={handleMachineChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select machine" />
                  </SelectTrigger>
                  <SelectContent>
                    {machineConfigs.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id}>
                        {machine.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {currentMachine && (
                <div className="space-y-2">
                  <Label>Quantity Preset</Label>
                  <Select value={String(selectedPresetQuantity)} onValueChange={handlePresetChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quantity" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentMachine.presets.map((preset) => (
                        <SelectItem key={preset.quantity} value={String(preset.quantity)}>
                          {preset.quantity.toLocaleString("en-IN")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {currentPreset && (
              <div className="grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground">
                <div>
                  <span className="block font-medium text-foreground">Product Size</span>
                  {currentPreset.productWidthIn}" × {currentPreset.productHeightIn}"
                </div>
                <div>
                  <span className="block font-medium text-foreground">Sheet Size</span>
                  {currentPreset.sheetWidthIn}" × {currentPreset.sheetHeightIn}"
                </div>
                <div>
                  <span className="block font-medium text-foreground">Printing</span>
                  {currentPreset.printingSide === "both" ? "Both sides" : "Single side"}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-accent" />
              Product Dimensions
            </CardTitle>
            <CardDescription>Enter finished size in centimetres</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productWidth" className="flex items-center gap-2">
                  Width (cm)
                  <HelpTooltip content="Finished product width in centimetres." />
                </Label>
                <Input
                  id="productWidth"
                  type="number"
                  min="0"
                  step="0.1"
                  value={inputs.productWidth === 0 ? "" : inputs.productWidth}
                  onChange={handleNumberChange("productWidth")}
                  onFocus={(event) => event.target.select()}
                  placeholder="Width"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productHeight" className="flex items-center gap-2">
                  Height (cm)
                  <HelpTooltip content="Finished product height in centimetres." />
                </Label>
                <Input
                  id="productHeight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={inputs.productHeight === 0 ? "" : inputs.productHeight}
                  onChange={handleNumberChange("productHeight")}
                  onFocus={(event) => event.target.select()}
                  placeholder="Height"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity" className="flex items-center gap-2">
                  Quantity
                  <HelpTooltip content="Total number of finished pieces required." />
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={inputs.quantity === 0 ? "" : inputs.quantity}
                  onChange={handleNumberChange("quantity")}
                  onFocus={(event) => event.target.select()}
                  placeholder="Quantity"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-accent" />
              Paper & Printing
            </CardTitle>
            <CardDescription>Choose paper profile and printing configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paperProfile" className="flex items-center gap-2">
                Paper Profile
                <HelpTooltip content="Select template to pre-fill GSM and paper price. You can further fine-tune below." />
              </Label>
              <Select
                value={inputs.selectedPaperProfileId}
                onValueChange={handlePaperProfileChange}
              >
                <SelectTrigger id="paperProfile">
                  <SelectValue placeholder="Select paper profile" />
                </SelectTrigger>
                <SelectContent>
                  {settings.paperProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name} ({profile.defaultGSM} GSM)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gsm" className="flex items-center gap-2">
                  GSM
                  <HelpTooltip content="Enter the exact GSM required for this job." />
                </Label>
                <Input
                  id="gsm"
                  type="number"
                  min="0"
                  step="1"
                  value={inputs.gsm === 0 ? "" : inputs.gsm}
                  onChange={handleNumberChange("gsm")}
                  onFocus={(event) => event.target.select()}
                  placeholder="GSM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paperPricePer500" className="flex items-center gap-2">
                  Paper Price (₹ / 500 sheets)
                  <HelpTooltip content="Cost per 500-sheet bundle for the selected GSM." />
                </Label>
                <Input
                  id="paperPricePer500"
                  type="number"
                  min="0"
                  step="10"
                  value={inputs.paperPricePer500 === 0 ? "" : inputs.paperPricePer500}
                  onChange={handleNumberChange("paperPricePer500")}
                  onFocus={(event) => event.target.select()}
                  placeholder="₹"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Printing Side
                <HelpTooltip content="Select printing side. Both sides multiplies slab price using settings multiplier." />
              </Label>
              <Select
                value={inputs.printingSide}
                onValueChange={(value: "single" | "both") => handlePrintingSideChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Printing side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Side</SelectItem>
                  <SelectItem value="both">Both Sides</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-accent" />
              Sheet Layout
            </CardTitle>
            <CardDescription>Optimise sheet usage for minimum wastage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Sheet Selection Mode
                <HelpTooltip content="Auto mode selects the sheet with maximum UPS. Manual mode lets you override and inspect fit." />
              </Label>
              <Select
                value={inputs.sheetSelectionMode}
                onValueChange={(value: "auto" | "manual") => handleSheetModeChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sheet selection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto - Best Fit</SelectItem>
                  <SelectItem value="manual">Manual Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {inputs.sheetSelectionMode === "manual" && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Choose Sheet
                  <HelpTooltip content="Select sheet size to use. UPS and wastage recalculate instantly." />
                </Label>
                <Select
                  value={inputs.selectedSheetId ?? settings.sheetOptions[0]?.id}
                  onValueChange={handleSheetChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sheet" />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.sheetOptions.map((option) => {
                      const detail = sheetDescriptions.get(option.id);
                      const upsInfo = detail
                        ? `(${detail.bestUPS || 0} UPS)`
                        : "";
                      return (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label} {upsInfo}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="rounded-lg border bg-muted/40 p-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TableIcon className="h-4 w-4" />
                <span>
                  Best fit:{" "}
                  {results.selectedSheet
                    ? `${results.selectedSheet.label} • ${results.ups} UPS (${results.selectedOrientation === "rotated" ? "Rotated" : "Standard"} layout)`
                    : "No fit available"}
                </span>
              </div>
              {inputs.sheetSelectionMode === "manual" && selectedSheetEval && (
                <p className="mt-2 text-muted-foreground">
                  Manual selection yields {selectedSheetEval.bestUPS} UPS ({selectedSheetEval.bestOrientation} orientation).
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Finishing & Conversions
            </CardTitle>
            <CardDescription>Toggle processes to include in cost</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lamination"
                checked={inputs.includeLamination}
                onCheckedChange={handleToggleChange("includeLamination")}
              />
              <Label htmlFor="lamination" className="flex cursor-pointer items-center gap-2">
                Lamination
                <HelpTooltip content="Adds lamination cost using per-1000 rate from settings." />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="varnish"
                checked={inputs.includeVarnish}
                onCheckedChange={handleToggleChange("includeVarnish")}
              />
              <Label htmlFor="varnish" className="flex cursor-pointer items-center gap-2">
                Varnish
                <HelpTooltip content="Uses sheet area divided by varnish divisor to estimate cost." />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="spotUV"
                checked={inputs.includeSpotUV}
                onCheckedChange={handleToggleChange("includeSpotUV")}
              />
              <Label htmlFor="spotUV" className="flex cursor-pointer items-center gap-2">
                Spot UV
                <HelpTooltip content="Applies tiered pricing (flat up to 1000 sheets, per-sheet thereafter)." />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="foiling"
                checked={inputs.includeFoiling}
                onCheckedChange={handleToggleChange("includeFoiling")}
              />
              <Label htmlFor="foiling" className="flex cursor-pointer items-center gap-2">
                Foiling
                <HelpTooltip content="Uses quantity-based threshold for foiling cost." />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="embossing"
                checked={inputs.includeEmbossing}
                onCheckedChange={handleToggleChange("includeEmbossing")}
              />
              <Label htmlFor="embossing" className="flex cursor-pointer items-center gap-2">
                Embossing
                <HelpTooltip content="Charges per unit using rate from settings." />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="creasing"
                checked={inputs.includeCreasing}
                onCheckedChange={handleToggleChange("includeCreasing")}
              />
              <Label htmlFor="creasing" className="flex cursor-pointer items-center gap-2">
                Creasing
                <HelpTooltip content="Applies per-1000 creasing cost from settings." />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cutting"
                checked={inputs.includeCutting}
                onCheckedChange={handleToggleChange("includeCutting")}
              />
              <Label htmlFor="cutting" className="flex cursor-pointer items-center gap-2">
                Cutting
                <HelpTooltip content="Applies per-1000 cutting cost from settings." />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="packaging"
                checked={inputs.includePackaging}
                onCheckedChange={handleToggleChange("includePackaging")}
              />
              <Label htmlFor="packaging" className="flex cursor-pointer items-center gap-2">
                Packaging
                <HelpTooltip content="Applies per-1000 packaging cost from settings." />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="envelope"
                checked={inputs.includeEnvelope}
                onCheckedChange={handleToggleChange("includeEnvelope")}
              />
              <Label htmlFor="envelope" className="flex cursor-pointer items-center gap-2">
                Envelope Conversion
                <HelpTooltip content="Adds envelope conversion cost based on quantity when enabled." />
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <IndianRupee className="h-6 w-6 text-accent" />
              Total Cost Summary
            </CardTitle>
            <CardDescription>Markup multiplier: {settings.markupMultiplier.toFixed(2)}×</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 rounded-xl border bg-muted/40 p-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Client Total</p>
                <p className="text-xl font-semibold text-foreground">
                  ₹{formatNumber(results.totalCostWithMarkup)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price per Unit</p>
                <p className="text-xl font-semibold text-foreground">
                  ₹{formatNumber(results.perUnitCost)}
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sheets Needed</span>
                <span className="font-medium">{results.totalSheets}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">UPS</span>
                <span className="font-medium">{results.ups}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Wastage (pcs)</span>
                <span className="font-medium">{results.wastagePieces}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Wastage %</span>
                <span className="font-medium">{(results.wastagePercent * 100).toFixed(2)}%</span>
              </div>
            </div>

            <SecureCostReveal>
              <div className="space-y-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-xs uppercase text-muted-foreground">Actual cost subtotal</span>
                    <p className="text-lg font-semibold">₹{formatNumber(results.subtotalCost)}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-muted-foreground">Sheet Price</span>
                    <p className="text-lg font-semibold">₹{formatNumber(results.sheetPrice)}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-muted-foreground">Total Paper Cost</span>
                    <p className="text-lg font-semibold">₹{formatNumber(results.totalPaperCost)}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Printing Cost</span>
                    <span className="font-medium">₹{formatNumber(results.printingCost)}</span>
                  </div>
                  {results.laminationCost > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Lamination</span>
                      <span className="font-medium">₹{formatNumber(results.laminationCost)}</span>
                    </div>
                  )}
                  {results.varnishCost > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Varnish</span>
                      <span className="font-medium">₹{formatNumber(results.varnishCost)}</span>
                    </div>
                  )}
                  {results.spotUVCost > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Spot UV</span>
                      <span className="font-medium">₹{formatNumber(results.spotUVCost)}</span>
                    </div>
                  )}
                  {results.foilingCost > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Foiling</span>
                      <span className="font-medium">₹{formatNumber(results.foilingCost)}</span>
                    </div>
                  )}
                  {results.embossingCost > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Embossing</span>
                      <span className="font-medium">₹{formatNumber(results.embossingCost)}</span>
                    </div>
                  )}
                  {results.creasingCost > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Creasing</span>
                      <span className="font-medium">₹{formatNumber(results.creasingCost)}</span>
                    </div>
                  )}
                  {results.cuttingCost > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cutting</span>
                      <span className="font-medium">₹{formatNumber(results.cuttingCost)}</span>
                    </div>
                  )}
                  {results.packagingCost > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Packaging</span>
                      <span className="font-medium">₹{formatNumber(results.packagingCost)}</span>
                    </div>
                  )}
                  {results.envelopeCost > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Envelope</span>
                      <span className="font-medium">₹{formatNumber(results.envelopeCost)}</span>
                    </div>
                  )}
                </div>
              </div>
            </SecureCostReveal>

            <div className="pt-4">
              <Button className="w-full" size="lg" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-5 w-5" />
                Download PDF Quote
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-accent" />
              Sheet Utilisation
            </CardTitle>
            <CardDescription>Compare sheet options and UPS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sheet</TableHead>
                  <TableHead className="text-right">Size (cm)</TableHead>
                  <TableHead className="text-right">UPS WxH</TableHead>
                  <TableHead className="text-right">UPS HxW</TableHead>
                  <TableHead className="text-right">Best UPS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.sheetEvaluations.map((evaluation) => {
                  const isActive = results.selectedSheet?.id === evaluation.option.id;
                  return (
                    <TableRow key={evaluation.option.id} className={isActive ? "bg-accent/10" : undefined}>
                      <TableCell>{evaluation.option.label}</TableCell>
                      <TableCell className="text-right">
                        {(evaluation.option.width / 2.54).toFixed(2)} × {(evaluation.option.height / 2.54).toFixed(2)} in
                      </TableCell>
                      <TableCell className="text-right">{evaluation.upsStandard}</TableCell>
                      <TableCell className="text-right">{evaluation.upsRotated}</TableCell>
                      <TableCell className="text-right">
                        {evaluation.bestUPS} {isActive ? "★" : ""}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
              <p>
                UPS values represent the number of finished pieces that can be imposed on the flat sheet.
                Auto mode highlights the most efficient sheet automatically. You can override via manual selection when needed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


