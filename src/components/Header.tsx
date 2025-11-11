import { Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/features">
            <Button variant="ghost" size="sm">Features</Button>
          </Link>
          <Link to="/pricing">
            <Button variant="ghost" size="sm">Pricing</Button>
          </Link>
          {session ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
              <Button variant="hero" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link to="/signin">
                <Button variant="hero" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Quick QR
                </span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-8">
              <Link to="/features" onClick={closeMobileMenu}>
                <Button variant="ghost" size="lg" className="w-full justify-start">
                  Features
                </Button>
              </Link>
              <Link to="/pricing" onClick={closeMobileMenu}>
                <Button variant="ghost" size="lg" className="w-full justify-start">
                  Pricing
                </Button>
              </Link>
              {session ? (
                <>
                  <Link to="/dashboard" onClick={closeMobileMenu}>
                    <Button variant="outline" size="lg" className="w-full justify-start">
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="hero" size="lg" onClick={handleLogout} className="w-full justify-start">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/signin" onClick={closeMobileMenu}>
                    <Button variant="outline" size="lg" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signin" onClick={closeMobileMenu}>
                    <Button variant="hero" size="lg" className="w-full justify-start">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
