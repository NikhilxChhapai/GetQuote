import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Box, Info, CheckCircle2 } from "lucide-react";

export const BoxGuide = () => {
  return (
    <div className="space-y-6">
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-primary" />
            How to Use Box Calculator
          </CardTitle>
          <CardDescription>Step-by-step guide with example</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Enter Box Dimensions</h4>
                <p className="text-sm text-muted-foreground">Input Length, Width, and Height in inches. The calculator automatically adds material for folding.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Set Quantity</h4>
                <p className="text-sm text-muted-foreground">Enter the number of boxes you need. Larger quantities may have better per-unit pricing.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Select Materials</h4>
                <p className="text-sm text-muted-foreground">Choose board thickness (1.7mm to 2.9mm) and paper type for wrapping.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Add Premium Finishes</h4>
                <p className="text-sm text-muted-foreground">Optional: Select foiling, embossing, or spot UV for luxury finishes.</p>
              </div>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Example:</strong> For a 12" × 8" × 3" box with 300 quantity, 2.4mm board, and matt lamination paper:
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                <li>Flat board size: 18" × 14"</li>
                <li>Units per sheet (UPS): 4 boxes</li>
                <li>Total cost includes: Board, Paper, Printing, and any selected finishes</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Tips for Best Results
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Standard sheet size is 42" × 60" for optimal cutting</li>
              <li>2.4mm board is recommended for premium rigid boxes</li>
              <li>Matt lamination is cost-effective for most applications</li>
              <li>Add 10-15% extra quantity for potential wastage</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
