import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { toast } from "sonner";

interface PasswordProtectionProps {
  onCorrectPassword: () => void;
}

export const PasswordProtection = ({ onCorrectPassword }: PasswordProtectionProps) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "1234") {
      onCorrectPassword();
      toast.success("Access granted!");
    } else {
      toast.error("Incorrect password");
      setPassword("");
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-elegant)]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-[var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-elegant)]">
              <Lock className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Settings Protected</CardTitle>
          <CardDescription>Enter password to access settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center text-lg"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Unlock Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
