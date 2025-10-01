import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Info, CheckCircle2 } from "lucide-react";

export const BusinessCardGuide = () => {
  return (
    <div className="space-y-6">
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            How to Use Business Card Calculator
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
                <h4 className="font-semibold mb-1">Enter Card Dimensions</h4>
                <p className="text-sm text-muted-foreground">Input Width and Height in inches. Standard size is 3.5" × 2". Custom sizes are also supported.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Set Quantity</h4>
                <p className="text-sm text-muted-foreground">Enter card quantity. Paper pricing is tiered - more cards = lower cost per card.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Select Paper Type</h4>
                <p className="text-sm text-muted-foreground">Choose from various paper types (matt, suede, classic, kraft, pearl, cotton) and weights (350gsm or 600gsm).</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Add Premium Treatments</h4>
                <p className="text-sm text-muted-foreground">Select from 10+ luxury treatments: foiling, raised UV, letterpress, embossing, edge paint, laser cutting, and more.</p>
              </div>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Example:</strong> For standard 3.5" × 2" business cards, 500 quantity, 350 matt paper with foiling:
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                <li>Sheet size: 12" × 18" (standard)</li>
                <li>UPS (Units Per Sheet): 21 cards per sheet</li>
                <li>Sheets needed: 26 sheets (includes 3 wastage sheets)</li>
                <li>Total cost: Paper cost + selected treatments</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Tips for Best Results
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>350gsm matt is the most economical choice</li>
              <li>600gsm papers provide ultra-premium thick cards</li>
              <li>Cotton paper offers a unique textured luxury feel</li>
              <li>Combine treatments like foiling + edge paint for maximum impact</li>
              <li>Order in multiples of 100 for best pricing tiers</li>
              <li>Standard sheet can fit 21 cards (3.5" × 2" size)</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">Treatment Descriptions:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div><strong>Foiling:</strong> Metallic shine finish</div>
              <div><strong>Raised UV:</strong> 3D glossy effect</div>
              <div><strong>Letterpress:</strong> Pressed indentation</div>
              <div><strong>Embossing:</strong> Raised texture</div>
              <div><strong>Edge Paint:</strong> Colored card edges</div>
              <div><strong>Edge Gilding:</strong> Metallic card edges</div>
              <div><strong>Laser Cutting:</strong> Custom die-cut shapes</div>
              <div><strong>Electroplating:</strong> Metallic coating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
