import {
  OffsetCalculatorInputs,
  OffsetCalculationResult,
  OffsetPrintingSettings,
  OffsetSheetOption,
  SheetEvaluation,
} from "@/types/offset";

const safeDimension = (value: number) => (value > 0 ? value : 0);

const calculateUPS = (sheet: OffsetSheetOption, width: number, height: number) => {
  if (width <= 0 || height <= 0) {
    return {
      standard: 0,
      rotated: 0,
    };
  }

  const usableWidth = safeDimension(sheet.width);
  const usableHeight = safeDimension(sheet.height);

  if (usableWidth === 0 || usableHeight === 0) {
    return {
      standard: 0,
      rotated: 0,
    };
  }

  const standard =
    Math.floor(usableWidth / width) *
    Math.floor(usableHeight / height);

  const rotated =
    Math.floor(usableWidth / height) *
    Math.floor(usableHeight / width);

  return {
    standard: Number.isFinite(standard) && standard > 0 ? standard : 0,
    rotated: Number.isFinite(rotated) && rotated > 0 ? rotated : 0,
  };
};

const pickBestSheet = (
  evaluations: SheetEvaluation[],
  mode: OffsetCalculatorInputs["sheetSelectionMode"],
  selectedSheetId?: string,
) => {
  if (mode === "manual" && selectedSheetId) {
    const manual = evaluations.find((evaluation) => evaluation.option.id === selectedSheetId);
    if (manual) {
      return manual;
    }
  }

  return evaluations.reduce<SheetEvaluation | null>((best, current) => {
    if (!best) {
      return current;
    }

    if (current.bestUPS > best.bestUPS) {
      return current;
    }

    if (current.bestUPS === best.bestUPS && current.bestUPS > 0) {
      const currentArea = current.option.width * current.option.height;
      const bestArea = best.option.width * best.option.height;
      if (currentArea < bestArea) {
        return current;
      }
    }

    return best;
  }, null);
};

const calculatePrintingCost = (
  sheets: number,
  side: OffsetCalculatorInputs["printingSide"],
  settings: OffsetPrintingSettings,
) => {
  if (sheets <= 0) {
    return 0;
  }

  const breakpoints = Object.keys(settings.printingSlabs)
    .map(Number)
    .sort((a, b) => a - b);

  let baseCost = 0;
  for (const breakpoint of breakpoints) {
    if (sheets <= breakpoint) {
      baseCost = settings.printingSlabs[breakpoint];
      break;
    }
  }

  if (baseCost === 0) {
    baseCost = settings.perSheetAboveMax * sheets;
  }

  const multiplier = side === "both" ? settings.doubleSidedMultiplier : 1;
  return baseCost * multiplier;
};

export const calculateOffsetPrinting = (
  inputs: OffsetCalculatorInputs,
  settings: OffsetPrintingSettings,
): OffsetCalculationResult => {
  const productWidth = safeDimension(inputs.productWidth);
  const productHeight = safeDimension(inputs.productHeight);
  const quantity = Math.max(inputs.quantity, 0);

  const productArea = productWidth * productHeight;
  const productPerimeter = (productWidth + productHeight) * 2;

  const evaluations: SheetEvaluation[] = settings.sheetOptions.map((option) => {
    const { standard, rotated } = calculateUPS(option, productWidth, productHeight);
    let bestUPS = 0;
    let bestOrientation: SheetEvaluation["bestOrientation"] = "none";

    if (standard > rotated) {
      bestUPS = standard;
      bestOrientation = standard > 0 ? "standard" : "none";
    } else if (rotated > standard) {
      bestUPS = rotated;
      bestOrientation = rotated > 0 ? "rotated" : "none";
    } else {
      bestUPS = standard;
      bestOrientation = standard > 0 ? "standard" : "none";
    }

    return {
      option,
      upsStandard: standard,
      upsRotated: rotated,
      bestUPS,
      bestOrientation,
    };
  });

  const bestSheet = pickBestSheet(evaluations, inputs.sheetSelectionMode, inputs.selectedSheetId);
  const selectedOption = bestSheet?.option ?? null;
  const selectedOrientation = bestSheet?.bestOrientation ?? "none";
  const ups = bestSheet?.bestUPS ?? 0;

  const sheetArea = selectedOption ? selectedOption.width * selectedOption.height : 0;

  const totalSheets = ups > 0 ? Math.ceil(quantity / ups) + settings.safetySheets : 0;
  const wastagePieces = ups > 0 ? totalSheets * ups - quantity : 0;
  const wastagePercent = quantity > 0 && ups > 0
    ? totalSheets * ups / quantity - 1
    : 0;

  const sheetPrice = sheetArea > 0
    ? (sheetArea * inputs.gsm / 3100) * (inputs.paperPricePer500 / 500)
    : 0;

  const totalPaperCost = sheetPrice * totalSheets;

  const printingCost = calculatePrintingCost(totalSheets, inputs.printingSide, settings);

  const laminationCost = inputs.includeLamination
    ? (settings.laminationPerThousand / 1000) * quantity
    : 0;

  const varnishCost = inputs.includeVarnish
    ? (sheetArea / settings.varnishDivisor) * totalSheets
    : 0;

  const spotUVCost = inputs.includeSpotUV
    ? (totalSheets <= 1000 ? settings.spotUV.uptoThreshold : settings.spotUV.perSheetAbove * totalSheets)
    : 0;

  const foilingCost = inputs.includeFoiling
    ? (quantity <= settings.foiling.quantityThreshold
        ? settings.foiling.baseCost
        : settings.foiling.perUnitAbove * quantity)
    : 0;

  const embossingCost = inputs.includeEmbossing
    ? settings.embossingPerUnit * quantity
    : 0;

  const creasingCost = inputs.includeCreasing
    ? (settings.creasingPerThousand / 1000) * quantity
    : 0;

  const cuttingCost = inputs.includeCutting
    ? (settings.cuttingPerThousand / 1000) * quantity
    : 0;

  const packagingCost = inputs.includePackaging
    ? (settings.packagingPerThousand / 1000) * quantity
    : 0;

  const envelopeCost = inputs.includeEnvelope
    ? Math.max((800 / 1000) * quantity, 750)
    : 0;

  const subtotalCost =
    totalPaperCost +
    printingCost +
    laminationCost +
    varnishCost +
    spotUVCost +
    foilingCost +
    embossingCost +
    creasingCost +
    cuttingCost +
    packagingCost +
    envelopeCost;

  const totalCostWithMarkup = subtotalCost * settings.markupMultiplier;
  const perUnitCost = quantity > 0 ? totalCostWithMarkup / quantity : 0;

  return {
    productArea,
    productPerimeter,
    selectedSheet: selectedOption,
    selectedOrientation,
    sheetArea,
    ups,
    totalSheets,
    wastagePieces,
    wastagePercent,
    sheetPrice,
    totalPaperCost,
    printingCost,
    laminationCost,
    varnishCost,
    spotUVCost,
    foilingCost,
    embossingCost,
    creasingCost,
    cuttingCost,
    packagingCost,
    envelopeCost,
    subtotalCost,
    totalCostWithMarkup,
    perUnitCost,
    sheetEvaluations: evaluations,
  };
};


