export interface OffsetSheetOption {
  id: string;
  label: string;
  width: number; // in centimeters
  height: number; // in centimeters
}

export interface OffsetPaperProfile {
  id: string;
  name: string;
  defaultGSM: number;
  pricePer500: number;
}

export interface OffsetMachinePreset {
  quantity: number;
  productWidthIn: number;
  productHeightIn: number;
  paperType: string;
  gsm: number;
  sheetWidthIn: number;
  sheetHeightIn: number;
  printingSide: PrintingSideOption;
  includeLamination: boolean;
  includeVarnish: boolean;
  includeSpotUV: boolean;
  includeFoiling: boolean;
  includeEmbossing: boolean;
  includeCreasing: boolean;
  includeEnvelope?: boolean;
}

export interface OffsetMachineConfig {
  id: string;
  label: string;
  description?: string;
  presets: OffsetMachinePreset[];
}

export interface OffsetPrintingSettings {
  paperProfiles: OffsetPaperProfile[];
  sheetOptions: OffsetSheetOption[];
  printingSlabs: Record<number, number>;
  perSheetAboveMax: number;
  doubleSidedMultiplier: number;
  safetySheets: number;
  laminationPerThousand: number;
  embossingPerUnit: number;
  creasingPerThousand: number;
  cuttingPerThousand: number;
  packagingPerThousand: number;
  varnishDivisor: number;
  spotUV: {
    uptoThreshold: number;
    perSheetAbove: number;
  };
  foiling: {
    quantityThreshold: number;
    baseCost: number;
    perUnitAbove: number;
  };
  markupMultiplier: number;
  machineConfigs: OffsetMachineConfig[];
}

export type PrintingSideOption = "single" | "both";

export type SheetSelectionMode = "auto" | "manual";

export interface OffsetCalculatorInputs {
  productWidth: number;
  productHeight: number;
  quantity: number;
  selectedPaperProfileId: string;
  gsm: number;
  paperPricePer500: number;
  printingSide: PrintingSideOption;
  includeLamination: boolean;
  includeVarnish: boolean;
  includeSpotUV: boolean;
  includeFoiling: boolean;
  includeEmbossing: boolean;
  includeCreasing: boolean;
  includeCutting: boolean;
  includePackaging: boolean;
  includeEnvelope: boolean;
  sheetSelectionMode: SheetSelectionMode;
  selectedSheetId?: string;
}

export interface SheetEvaluation {
  option: OffsetSheetOption;
  upsStandard: number;
  upsRotated: number;
  bestUPS: number;
  bestOrientation: "standard" | "rotated" | "none";
}

export interface OffsetCalculationResult {
  productArea: number;
  productPerimeter: number;
  selectedSheet: OffsetSheetOption | null;
  selectedOrientation: "standard" | "rotated" | "none";
  sheetArea: number;
  ups: number;
  totalSheets: number;
  wastagePieces: number;
  wastagePercent: number;
  sheetPrice: number;
  totalPaperCost: number;
  printingCost: number;
  laminationCost: number;
  varnishCost: number;
  spotUVCost: number;
  foilingCost: number;
  embossingCost: number;
  creasingCost: number;
  cuttingCost: number;
  packagingCost: number;
  envelopeCost: number;
  subtotalCost: number;
  totalCostWithMarkup: number;
  perUnitCost: number;
  sheetEvaluations: SheetEvaluation[];
}


