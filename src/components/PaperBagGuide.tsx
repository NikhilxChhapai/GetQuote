import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShoppingBag, Ruler, Package, Sparkles } from "lucide-react";

export const PaperBagGuide = () => {
  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Paper Bag Calculator Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="dimensions">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Understanding Dimensions
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p><strong>Length:</strong> The width of the bag when laid flat (measured in inches)</p>
              <p><strong>Height:</strong> The vertical measurement of the bag (measured in inches)</p>
              <p><strong>Gusset:</strong> The depth or side panel of the bag that allows it to expand (measured in inches)</p>
              <p className="text-sm text-muted-foreground italic">
                Example: A bag with 11.9" length, 8.5" height, and 3.35" gusset will create a medium-sized shopping bag.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="paper-gsm">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Paper GSM Selection
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p><strong>270 GSM:</strong> Standard weight paper, suitable for most applications. Cost-effective and durable for general use.</p>
              <p><strong>300 GSM:</strong> Premium weight paper, provides extra strength and a more luxurious feel. Ideal for high-end products.</p>
              <p className="text-sm text-muted-foreground">
                GSM (grams per square meter) indicates paper thickness. Higher GSM means thicker, stronger paper.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="treatments">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Additional Treatments
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p><strong>Foiling:</strong> Metallic finish applied to enhance branding and create an elegant appearance. Available in gold, silver, and other colors.</p>
              <p><strong>Spot UV:</strong> High-gloss coating applied to specific areas, creating contrast and highlighting logos or text.</p>
              <p className="text-sm text-muted-foreground">
                These treatments are optional and will increase the total cost. They add a premium look to your paper bags.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="quantity">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Quantity & Pricing
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p>Pricing varies based on quantity ordered. Larger quantities typically result in lower per-unit costs due to economies of scale.</p>
              <p>Available quantities: 100, 200, 250, 300, 500, 1000, 2000, 3000, and 5000 bags.</p>
              <p className="text-sm text-muted-foreground">
                For the best pricing, consider ordering in bulk if you have ongoing needs.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pdf">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Downloading Quotations
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p>Once you've configured your paper bag specifications, you can download a professional PDF quotation.</p>
              <p>The PDF includes:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Complete bag specifications</li>
                <li>Selected treatments and features</li>
                <li>Detailed pricing breakdown</li>
                <li>Per-bag and total costs</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                This PDF can be directly shared with customers or used for your records.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
