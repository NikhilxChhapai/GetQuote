import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Box, Layers, Sparkles, IndianRupee } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const HelpDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Box Price Calculator Guide</DialogTitle>
          <DialogDescription>
            Learn how to use the calculator and understand the pricing formula
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
              <Box className="h-5 w-5 text-accent" />
              Box Dimensions
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Enter the finished box dimensions in inches:
            </p>
            <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
              <li><strong>Length:</strong> The longest side of the box</li>
              <li><strong>Width:</strong> The shorter horizontal side</li>
              <li><strong>Height:</strong> The depth of the box</li>
              <li><strong>Quantity:</strong> Number of boxes to produce</li>
            </ul>
            <div className="bg-muted/50 p-3 rounded-lg mt-3">
              <p className="text-sm font-medium mb-1">Example:</p>
              <p className="text-sm text-muted-foreground">
                12" × 8" × 3" box = A standard gift box size (like for a shirt)
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
              <Layers className="h-5 w-5 text-accent" />
              Materials Selection
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Choose the quality and finish of your box:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Board Thickness:</p>
                <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
                  <li><strong>1.7mm:</strong> Light - Best for small, lightweight items</li>
                  <li><strong>1.9mm:</strong> Standard - Good balance of strength and cost</li>
                  <li><strong>2.4mm:</strong> Premium - Sturdy, professional feel</li>
                  <li><strong>2.9mm:</strong> Luxury - Maximum durability and quality</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium">Paper Type:</p>
                <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
                  <li><strong>Matt Lamination:</strong> Smooth, non-reflective finish</li>
                  <li><strong>Canvas:</strong> Textured, artistic appearance</li>
                  <li><strong>Color Council:</strong> Premium color accuracy</li>
                  <li><strong>Plike:</strong> Plastic-like, water-resistant</li>
                  <li><strong>Suede:</strong> Soft, luxurious feel</li>
                  <li><strong>Key Colour:</strong> Vibrant color reproduction</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
              <Sparkles className="h-5 w-5 text-accent" />
              Premium Finishes
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Optional enhancements to make your box stand out:
            </p>
            <ul className="text-sm space-y-2 ml-4 list-disc text-muted-foreground">
              <li><strong>Foiling:</strong> Metallic shine (gold, silver, rose gold)</li>
              <li><strong>Embossing:</strong> Raised design for texture and elegance</li>
              <li><strong>Spot UV:</strong> Glossy coating on specific areas for contrast</li>
            </ul>
            <div className="bg-muted/50 p-3 rounded-lg mt-3">
              <p className="text-sm font-medium mb-1">Example:</p>
              <p className="text-sm text-muted-foreground">
                Add foiling to your logo and embossing to a pattern for a luxury look
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
              <IndianRupee className="h-5 w-5 text-accent" />
              Price Calculation Formula
            </h3>
            <div className="space-y-3 text-sm">
              <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                <p className="font-mono text-xs mb-2">Total Price = Board Cost + Paper Cost + Printing + Finishes</p>
              </div>
              
              <div>
                <p className="font-medium mb-1">1. Board Cost:</p>
                <p className="text-muted-foreground ml-4">
                  Flat dimensions = (Length + Height×2) × (Width + Height×2)<br/>
                  Units per sheet = Standard sheet area ÷ Flat box area<br/>
                  Sheets needed = Quantity ÷ Units per sheet (rounded up)<br/>
                  Board cost = Sheets needed × Price per sheet
                </p>
              </div>

              <div>
                <p className="font-medium mb-1">2. Paper Cost:</p>
                <p className="text-muted-foreground ml-4">
                  Sheets needed = Quantity × 2.5 (for wrapping)<br/>
                  Paper cost = Sheets needed × Price per sheet
                </p>
              </div>

              <div>
                <p className="font-medium mb-1">3. Fixed Costs:</p>
                <p className="text-muted-foreground ml-4">
                  Printing + Selected finishes (Foiling, Embossing, Spot UV)
                </p>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium mb-1">Complete Example:</p>
                <p className="text-muted-foreground">
                  12"×8"×3" box, 300 qty, 2.4mm board, Matt Lam paper:<br/>
                  • Flat size: 18"×14" → 4 boxes per sheet → 75 sheets needed<br/>
                  • Board: 75 sheets × ₹60 = ₹4,500<br/>
                  • Paper: 750 sheets × ₹14 = ₹10,500<br/>
                  • Printing: ₹3,000<br/>
                  • Total: ₹18,000 = ₹60 per box
                </p>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
