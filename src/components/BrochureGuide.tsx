import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Info, CheckCircle2 } from "lucide-react";

export const BrochureGuide = () => {
  return (
    <div className="space-y-6">
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            How to Use Brochure Calculator
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
                <h4 className="font-semibold mb-1">Enter Brochure Dimensions</h4>
                <p className="text-sm text-muted-foreground">Input Length, Height, and Gusset (if any) in inches. Gusset is the expandable side panel.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Set Quantity</h4>
                <p className="text-sm text-muted-foreground">Enter the number of brochures needed. Quantity affects printing costs significantly.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Select Paper GSM</h4>
                <p className="text-sm text-muted-foreground">Choose paper weight from 250 to 350 GSM. Higher GSM = thicker, more premium paper.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Choose Finishing Options</h4>
                <p className="text-sm text-muted-foreground">Select lamination, foiling, spot UV, embossing, or pocket options as needed.</p>
              </div>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Example:</strong> For a 30" × 10" brochure with 2" gusset, 500 quantity, 300 GSM paper with lamination:
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                <li>Flat dimensions: 33" × 12.9" (includes gusset calculation)</li>
                <li>Standard sheet: 36" × 12.5"</li>
                <li>Total cost includes: Paper, Printing, Lamination, Die Cutting, and Packing</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Tips for Best Results
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>300 GSM is the most popular choice for brochures</li>
              <li>Lamination protects against wear and tear</li>
              <li>Gusset adds expandable depth for folder-style brochures</li>
              <li>Die cutting cost is automatically calculated per sheet</li>
              <li>Larger quantities (1000+) have better printing rates</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
