import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Plus, QrCode, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    // For now, this is a placeholder - will be replaced with real auth
    const checkAuth = () => {
      // TODO: Replace with actual Supabase auth check
      const isLoggedIn = false; // Placeholder
      
      if (!isLoggedIn) {
        navigate('/signin');
      } else {
        setUser({ email: 'user@example.com' }); // Placeholder
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    // TODO: Implement actual logout
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Quick QR
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My QR Codes</h1>
              <p className="text-muted-foreground">
                Create and manage your QR codes
              </p>
            </div>
            <Button variant="hero" size="lg" onClick={() => navigate('/create')}>
              <Plus className="w-5 h-5 mr-2" />
              Create New QR
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total QR Codes</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Static Codes</p>
                  <p className="text-3xl font-bold">0 / 20</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-accent" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dynamic Codes</p>
                  <p className="text-3xl font-bold">0 / 1</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Free trial available</p>
            </Card>
          </div>

          {/* Empty State */}
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                <QrCode className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No QR codes yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Get started by creating your first QR code. You can create up to 20 static codes
                and 1 dynamic code on the free plan.
              </p>
              <Button variant="hero" size="lg" onClick={() => navigate('/create')}>
                <Plus className="w-5 h-5 mr-2" />
                Create Your First QR Code
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
