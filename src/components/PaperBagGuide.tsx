import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShoppingBag, Ruler, Package, Sparkles, FileText } from "lucide-react";

export const PaperBagGuide = () => {
  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <ShoppingBag className="h-6 w-6 text-primary" />
          Paper Bag Calculator Guide
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Complete guide to understanding paper types, specifications, and pricing
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="paper-types">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Paper Types & Quality
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">SBS 2 Sheets</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    Standard quality paper bags with double-sheet construction. Available in 270 GSM and 300 GSM. 
                    Ideal for retail packaging, shopping bags, and general-purpose use. Supports Foiling and Spot UV treatments.
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <p className="font-semibold text-green-900 dark:text-green-100">SBS 1 Sheet</p>
                  <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                    Economy option with single-sheet construction. Available in 270 GSM and 300 GSM. 
                    Cost-effective solution for high-volume orders. Also supports Foiling and Spot UV.
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                  <p className="font-semibold text-purple-900 dark:text-purple-100">Keycolor Paper</p>
                  <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                    Premium quality paper (250 GSM) with vibrant color options. Perfect for luxury brands and 
                    high-end retail. Supports Foiling and Embossing for elegant finishes.
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <p className="font-semibold text-amber-900 dark:text-amber-100">Kraft Paper</p>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                    Eco-friendly natural kraft paper (250 GSM). Sustainable choice with rustic charm. 
                    Popular for organic products, cafes, and environmentally conscious brands. Supports Foiling and Embossing.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="dimensions">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Understanding Dimensions
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p><strong>Length:</strong> The width of the bag when laid flat, measured in inches. This is the opening width of your bag.</p>
              <p><strong>Height:</strong> The vertical measurement from bottom to top of the bag in inches. This determines how tall your bag will be.</p>
              <p><strong>Gusset:</strong> The depth or expandable side panel of the bag (measured in inches). Larger gusset allows the bag to hold bulkier items.</p>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="font-semibold mb-2">📏 Example Sizes:</p>
                <ul className="space-y-2 text-sm">
                  <li><strong>Small:</strong> 8" L × 9.5" H × 2.5" G - Perfect for jewelry, small gifts</li>
                  <li><strong>Medium:</strong> 12" L × 16" H × 4.5" G - Ideal for clothing, books</li>
                  <li><strong>Large:</strong> 17" L × 13" H × 6" G - Great for larger items, groceries</li>
                </ul>
              </div>
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
              <p><strong>250 GSM:</strong> Used for Keycolor and Kraft papers. Provides good strength with premium aesthetics.</p>
              <p><strong>270 GSM:</strong> Standard weight for SBS papers. Cost-effective and durable for everyday use.</p>
              <p><strong>300 GSM:</strong> Heavier weight option for SBS papers. Extra strength and premium feel, recommended for valuable products.</p>
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>GSM (Grams per Square Meter)</strong> indicates paper thickness and weight. 
                  Higher GSM = thicker, stronger, and more durable paper bags.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="treatments">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Finishing & Treatments
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">✨ Foiling</p>
                  <p className="text-sm mt-1">
                    Metallic finish applied to enhance branding and create an elegant appearance. 
                    Available in gold, silver, rose gold, and other colors. Creates eye-catching shimmer 
                    and premium look. Ideal for logos, text, and decorative patterns.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Available on all paper types</p>
                </div>
                
                <div>
                  <p className="font-semibold">💎 Spot UV</p>
                  <p className="text-sm mt-1">
                    High-gloss coating applied to specific areas, creating stunning contrast with matte backgrounds. 
                    Highlights logos, text, or images with a raised, glossy effect. Adds tactile dimension 
                    and visual interest to your bags.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Only available for SBS paper types</p>
                </div>
                
                <div>
                  <p className="font-semibold">🎨 Embossing</p>
                  <p className="text-sm mt-1">
                    Creates raised or recessed designs on the paper surface. Adds texture and depth to logos 
                    and patterns. Sophisticated technique that provides a luxury tactile experience. 
                    Can be combined with foiling for dramatic effects.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Available for Keycolor and Kraft papers</p>
                </div>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>💡 Pro Tip:</strong> Combining treatments (like Foiling + Embossing) creates 
                  premium luxury packaging that significantly elevates brand perception. These treatments 
                  increase cost but provide excellent value for high-end products.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="quantity">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Quantity & Bulk Pricing
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p>Pricing varies significantly based on order quantity due to economies of scale in production and setup costs.</p>
              <p><strong>Available quantities:</strong> 60, 100, 200, 250, 300, 500, 800, 1000, 2000, 3000, 5000, and 7500 bags.</p>
              <div className="mt-3 space-y-2">
                <p className="font-semibold">💰 Bulk Discounts:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Orders of 1000+ bags typically save 30-40% per unit</li>
                  <li>Orders of 5000+ bags offer the best per-unit pricing</li>
                  <li>Small quantities (60-250) have higher setup costs per bag</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>💡 Cost Savings:</strong> Consider ordering in bulk if you have ongoing needs. 
                  The per-bag cost decreases dramatically with volume, making larger orders much more cost-effective.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pdf">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Downloading Quotations
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p>Generate professional PDF quotations that you can send directly to customers or use for your records.</p>
              <p className="font-semibold mt-3">The PDF includes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Professional header with quotation number and date</li>
                <li>Customer name and details</li>
                <li>Complete bag specifications (type, dimensions, GSM)</li>
                <li>Selected finishing treatments with visual indicators</li>
                <li>Detailed pricing breakdown</li>
                <li>Per-bag and total costs clearly displayed</li>
                <li>Terms and conditions</li>
                <li>Professional footer</li>
              </ul>
              <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>📄 Pro Feature:</strong> The generated PDF is client-ready with professional 
                  formatting, making it perfect for sending quotations directly to customers. No additional 
                  formatting or editing needed!
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
