import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Plus, QrCode, Trash2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

interface QRCodeData {
  id: string;
  name: string;
  type: string;
  destination_url: string;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/signin");
        return;
      }
      
      setUser(session.user);
      await fetchQRCodes();
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/signin");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchQRCodes = async () => {
    const { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load QR codes");
      console.error(error);
    } else {
      setQrCodes(data || []);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("qr_codes")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete QR code");
    } else {
      toast.success("QR code deleted");
      fetchQRCodes();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const staticCount = qrCodes.filter(qr => qr.type === 'static').length;
  const dynamicCount = qrCodes.filter(qr => qr.type === 'dynamic').length;

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
                  <p className="text-3xl font-bold">{qrCodes.length}</p>
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
                  <p className="text-3xl font-bold">{staticCount} / 20</p>
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
                  <p className="text-3xl font-bold">{dynamicCount} / 1</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Free trial available</p>
            </Card>
          </div>

          {/* QR Codes List or Empty State */}
          {qrCodes.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrCodes.map((qr) => (
                <Card key={qr.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{qr.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{qr.type}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(qr.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground truncate">
                        {qr.destination_url}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{qr.status}</span>
                      <span>{new Date(qr.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
