import { useState, useEffect } from "react";
import { Calculator } from "@/components/Calculator";
import { BrochureCalculator } from "@/components/BrochureCalculator";
import { BusinessCardCalculator } from "@/components/BusinessCardCalculator";
import { PaperBagCalculator } from "@/components/PaperBagCalculator";
import { BoxPricingSettings } from "@/components/BoxPricingSettings";
import { BrochurePricingSettings } from "@/components/BrochurePricingSettings";
import { BusinessCardPricingSettings } from "@/components/BusinessCardPricingSettings";
import { PaperBagPricingSettings } from "@/components/PaperBagPricingSettings";
import { BoxGuide } from "@/components/BoxGuide";
import { BrochureGuide } from "@/components/BrochureGuide";
import { BusinessCardGuide } from "@/components/BusinessCardGuide";
import { PaperBagGuide } from "@/components/PaperBagGuide";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { PasswordProtection } from "@/components/PasswordProtection";
import { HelpDialog } from "@/components/HelpDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator as CalculatorIcon, Settings, FileText, CreditCard, HelpCircle, ShoppingBag } from "lucide-react";
import { sbs2SheetsPricingData } from "@/data/paperBagPricing";

const Index = () => {
  const [userName, setUserName] = useState("");
  const [settingsUnlocked, setSettingsUnlocked] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    localStorage.setItem("userName", name);
  };

  const [boxPricing, setBoxPricing] = useState({
    boardPrices: {
      "1.7mm": 42,
      "1.9mm": 50,
      "2.4mm": 60,
      "2.9mm": 73,
    },
    paperPrices: {
      "matt lam": 14,
      "canvas": 52,
      "color council": 30,
      "plike": 145,
      "suede": 180,
      "keycolour": 60,
    },
    printingBase: 3000,
    foilingBase: 10000,
    embossingBase: 15000,
    spotUVBase: 12000,
  });

  const [brochurePricing, setBrochurePricing] = useState({
    paperGSMPrices: {
      "250": 85,
      "280": 95,
      "290": 100,
      "300": 100,
      "350": 120,
    },
    printingBase: 5500,
    laminationBase: 1.8,
    dieCuttingBase: 1,
    packingBase: 2.5,
    foilingBase: 5000,
    spotUVBase: 6000,
    embossingBase: 15000,
    pocketBase: 5000,
  });

  const [businessCardPricing, setBusinessCardPricing] = useState({
    paperTypes: {
      "350 matt": { "100": 3.5, "250": 2.5, "500": 2.1, "1000": 2, "2000": 1.8, "3000": 1.75, "5000": 1.7, "10000": 1.5 },
      "350gsm suede": { "100": 5, "250": 3.5, "500": 3, "1000": 2.75, "2000": 2.6, "3000": 2.5, "5000": 2.3, "10000": 2.2 },
      "300gsm classic": { "100": 6, "250": 4, "500": 3.5, "1000": 3.25, "2000": 3, "3000": 2.9, "5000": 2.7, "10000": 2.6 },
      "300gsm kraft": { "100": 3, "250": 2, "500": 1.75, "1000": 1.5, "2000": 1.4, "3000": 1.3, "5000": 1.2, "10000": 1 },
      "300gsm pearl": { "100": 8, "250": 5.6, "500": 4.8, "1000": 4.5, "2000": 4.25, "3000": 4, "5000": 3.9, "10000": 3.75 },
      "600gsm suede": { "100": 9, "250": 6, "500": 5.5, "1000": 5, "2000": 4.75, "3000": 4.5, "5000": 4.25, "10000": 4 },
      "600gsm classic": { "100": 12, "250": 8.5, "500": 7.25, "1000": 6.75, "2000": 6.5, "3000": 6.25, "5000": 6, "10000": 5 },
      "600gsm colour": { "100": 14, "250": 9.5, "500": 8, "1000": 7.5, "2000": 7, "3000": 6.5, "5000": 6, "10000": 5.5 },
      "600gsm cotton": { "100": 24, "250": 17, "500": 15, "1000": 13.5, "2000": 12.5, "3000": 12, "5000": 11.5, "10000": 10 },
      "600gsm kraft": { "100": 6.5, "250": 4.5, "500": 3.75, "1000": 3.5, "2000": 3.25, "3000": 3.15, "5000": 3, "10000": 2.75 },
    },
    treatments: {
      foilingDigital: 200,
      raisedUV: 100,
      foilpress: 150,
      letterpress: 250,
      embossing: 150,
      electroplating: 180,
      edgepaint: 120,
      edgeGilding: 200,
      laserCutting: 150,
      stickerCutting: 100,
    },
  });

  const [paperBagPricing, setPaperBagPricing] = useState({
    baseData: sbs2SheetsPricingData,
    treatments: {
      foiling: 4000,
      spotUV: 3000,
    },
  });

  if (!userName) {
    return <WelcomeScreen onNameSubmit={handleNameSubmit} />;
  }

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)] transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-[var(--shadow-card)]">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-[var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-elegant)] hover:scale-105 transition-transform">
                <CalculatorIcon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-[var(--gradient-primary)] bg-clip-text text-transparent">
                  Price Calculator
                </h1>
                <p className="text-xs lg:text-sm text-muted-foreground">Welcome, {userName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HelpDialog />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <Tabs defaultValue="box" className="w-full">
          <TabsList className="grid w-full max-w-6xl mx-auto grid-cols-3 sm:grid-cols-6 gap-2 mb-6 lg:mb-8 h-auto p-2 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="box" className="flex items-center gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all">
              <CalculatorIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Box</span>
            </TabsTrigger>
            <TabsTrigger value="brochure" className="flex items-center gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Brochure</span>
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all">
              <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm hidden sm:inline">Card</span>
              <span className="text-xs sm:hidden">Card</span>
            </TabsTrigger>
            <TabsTrigger value="paperbag" className="flex items-center gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all">
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Paper Bag</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all">
              <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Guide</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="box" className="mt-0">
            <Calculator pricing={boxPricing} />
          </TabsContent>

          <TabsContent value="brochure" className="mt-0">
            <BrochureCalculator pricing={brochurePricing} />
          </TabsContent>

          <TabsContent value="card" className="mt-0">
            <BusinessCardCalculator pricing={businessCardPricing} />
          </TabsContent>

          <TabsContent value="paperbag" className="mt-0">
            <PaperBagCalculator pricing={paperBagPricing} userName={userName} />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            {!settingsUnlocked ? (
              <PasswordProtection onCorrectPassword={() => setSettingsUnlocked(true)} />
            ) : (
            <div className="max-w-5xl mx-auto">
              <Tabs defaultValue="box-settings" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 mb-6 h-auto p-2">
                  <TabsTrigger value="box-settings" className="text-xs sm:text-sm">Box</TabsTrigger>
                  <TabsTrigger value="brochure-settings" className="text-xs sm:text-sm">Brochure</TabsTrigger>
                  <TabsTrigger value="card-settings" className="text-xs sm:text-sm">Card</TabsTrigger>
                  <TabsTrigger value="paperbag-settings" className="text-xs sm:text-sm">Paper Bag</TabsTrigger>
                </TabsList>

                <TabsContent value="box-settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Box Calculator Pricing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BoxPricingSettings pricing={boxPricing} onUpdate={setBoxPricing} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="brochure-settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Brochure Calculator Pricing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BrochurePricingSettings pricing={brochurePricing} onUpdate={setBrochurePricing} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="card-settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Card Calculator Pricing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BusinessCardPricingSettings pricing={businessCardPricing} onUpdate={setBusinessCardPricing} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="paperbag-settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Paper Bag Calculator Pricing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PaperBagPricingSettings pricing={paperBagPricing} onUpdate={setPaperBagPricing} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            )}
          </TabsContent>

          <TabsContent value="guide" className="mt-0">
            <div className="max-w-5xl mx-auto">
              <Tabs defaultValue="box-guide" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 mb-6 h-auto p-2">
                  <TabsTrigger value="box-guide" className="text-xs sm:text-sm">Box</TabsTrigger>
                  <TabsTrigger value="brochure-guide" className="text-xs sm:text-sm">Brochure</TabsTrigger>
                  <TabsTrigger value="card-guide" className="text-xs sm:text-sm">Card</TabsTrigger>
                  <TabsTrigger value="paperbag-guide" className="text-xs sm:text-sm">Paper Bag</TabsTrigger>
                </TabsList>

                <TabsContent value="box-guide">
                  <BoxGuide />
                </TabsContent>

                <TabsContent value="brochure-guide">
                  <BrochureGuide />
                </TabsContent>

                <TabsContent value="card-guide">
                  <BusinessCardGuide />
                </TabsContent>

                <TabsContent value="paperbag-guide">
                  <PaperBagGuide />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-12 lg:mt-16">
        <div className="container mx-auto px-4 lg:px-6 py-6 text-center text-xs sm:text-sm text-muted-foreground">
          <p>Professional pricing calculator for boxes, brochures, business cards & paper bags</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
