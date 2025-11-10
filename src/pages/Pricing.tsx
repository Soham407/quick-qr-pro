import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { initiatePayment } from "@/lib/payment-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface QRCodeData {
  id: string;
  name: string;
  type: "static" | "dynamic";
  status: string;
}

const Pricing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showQRSelector, setShowQRSelector] = useState(false);
  const [dynamicQRCodes, setDynamicQRCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    
    if (session?.user) {
      // Fetch user's dynamic QR codes that are eligible for upgrade
      // Exclude already-active codes
      const { data } = await supabase
        .from("qr_codes")
        .select("id, name, type, status")
        .eq("type", "dynamic")
        .neq("status", "active")
        .order("created_at", { ascending: false });
      
      setDynamicQRCodes((data || []) as QRCodeData[]);
    }
  };

  const handleUpgradeClick = () => {
    if (!user) {
      navigate("/signin");
      return;
    }

    if (dynamicQRCodes.length === 0) {
      toast.error("You don't have any dynamic QR codes to upgrade. Create one first!");
      navigate("/create");
      return;
    }

    setShowQRSelector(true);
  };

  const handleQRCodeSelect = (qr: QRCodeData) => {
    setShowQRSelector(false);
    setLoading(true);

    initiatePayment({
      qrCodeId: qr.id,
      qrCodeName: qr.name,
      onSuccess: () => {
        setLoading(false);
        toast.success("Payment successful! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 2000);
      },
      onFailure: () => {
        setLoading(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Quick QR
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/features">
              <Button variant="ghost" size="sm">Features</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="ghost" size="sm">Pricing</Button>
            </Link>
            <Link to="/signin">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/">
              <Button variant="hero" size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
              Simple, Transparent
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 border-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Free</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">forever</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>20 Static QR Codes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>1 Dynamic QR Code (30-day trial)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>Custom frames & logos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>Download in multiple formats</span>
                  </li>
                </ul>
                <Link to="/" className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Pro Plan */}
            <Card className="p-8 border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                Popular
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Pro</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">$10</span>
                    <span className="text-muted-foreground">per code / year</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>All Free features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>Dynamic QR Codes at $10/year each</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>Edit destination URL anytime</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>Advanced scan analytics & tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>Priority email support</span>
                  </li>
                </ul>
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={handleUpgradeClick}
                  disabled={loading}
                >
                  {loading ? "Processing..." : user ? "Upgrade to Pro" : "Sign In to Upgrade"}
                </Button>
              </div>
            </Card>
          </div>

          {/* QR Code Selector Dialog */}
          <Dialog open={showQRSelector} onOpenChange={setShowQRSelector}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select QR Code to Upgrade</DialogTitle>
                <DialogDescription>
                  Choose which dynamic QR code you want to upgrade to Pro for $10/year
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 mt-4">
                {dynamicQRCodes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>All your dynamic QR codes are already active!</p>
                    <p className="text-sm mt-2">Create a new dynamic QR code to upgrade it.</p>
                  </div>
                ) : (
                  dynamicQRCodes.map((qr) => (
                    <Card
                      key={qr.id}
                      className="p-4 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleQRCodeSelect(qr)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{qr.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            Status: {qr.status.replace("_", " ")}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Select
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
