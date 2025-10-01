import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { toast } from "sonner";

interface WelcomeScreenProps {
  onNameSubmit: (name: string) => void;
}

export const WelcomeScreen = ({ onNameSubmit }: WelcomeScreenProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
      toast.success(`Welcome, ${name.trim()}!`);
    } else {
      toast.error("Please enter your name");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-elegant)]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-[var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-elegant)]">
              <Calculator className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl bg-[var(--gradient-primary)] bg-clip-text text-transparent">
            Welcome to Price Calculator
          </CardTitle>
          <CardDescription>Please enter your name to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-center text-lg"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
