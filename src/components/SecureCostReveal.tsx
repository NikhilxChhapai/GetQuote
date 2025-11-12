import { useEffect, useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SecureCostRevealProps {
  children: React.ReactNode;
  triggerLabel?: string;
  className?: string;
}

const STORAGE_KEY = "secure-cost-access";
const COST_PASSWORD = "1234";

export const SecureCostReveal = ({
  children,
  triggerLabel = "View Actual Cost",
  className,
}: SecureCostRevealProps) => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUnlocked(window.localStorage.getItem(STORAGE_KEY) === "true");
    }
  }, []);

  const handleUnlock = (event: React.FormEvent) => {
    event.preventDefault();
    if (password === COST_PASSWORD) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, "true");
      }
      setUnlocked(true);
      setOpen(false);
      setPassword("");
      toast.success("Actual cost unlocked");
    } else {
      toast.error("Incorrect password");
      setPassword("");
    }
  };

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/40 bg-muted/30 p-6 text-center shadow-inner">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Actual cost is protected. Unlock to view internal pricing.
        </p>
        <Button className="mt-4" onClick={() => setOpen(true)}>
          {triggerLabel}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Restricted Access
            </DialogTitle>
            <DialogDescription>
              Enter the access password to reveal the actual cost details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="secure-cost-password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="secure-cost-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                autoFocus
              />
            </div>
            <DialogFooter className="sm:justify-start">
              <Button type="submit" className="w-full sm:w-auto">
                Unlock
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};


