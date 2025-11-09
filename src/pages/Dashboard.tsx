import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Plus,
  QrCode,
  Trash2,
  LogOut,
  BarChart3,
  Edit,
  Shield,
  Filter,
  ArrowUpDown,
  Search,
  List,
  LayoutGrid,
  MoreVertical,
  Link2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"; // Import Sheet components
import QRCodePreview from "../components/QRCodePreview"; // Import our new component
import QRCodeStyling, { type Options as QRCodeOptions } from "qr-code-styling";
import { cn } from "@/lib/utils";
import { getRedirectUrl } from "@/lib/qr-utils";

interface QRCodeData {
  id: string;
  name: string;
  type: "static" | "dynamic";
  short_url: string | null;
  destination_url: string;
  status: string;
  created_at: string;
  updated_at: string;
  qr_design: {
    dot_color: string | null;
    background_color: string | null;
    corner_color: string | null;
    logo_url: string | null;
    frame_text: string | null;
  } | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  
  // State for inline editing in the grid view
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState<string>("");

  // --- NEW STATE FOR UI CONTROLS ---
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQr, setSelectedQr] = useState<QRCodeData | null>(null); // This controls the sheet
  
  // Ref for downloading from the sheet
  const qrSheetPreviewRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // ... (same as your existing code)
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
    // ... (same as your existing auth listener)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (!session) { navigate("/signin"); } else { setUser(session.user); }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchQRCodes = async () => {
    // ... (same as your existing code, ensures qr_design is fetched)
    const { data, error } = await supabase
      .from("qr_codes")
      .select("*, qr_design(*)")
      .order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load QR codes"); } else { setQrCodes((data || []) as QRCodeData[]); }
  };

  const handleDelete = async (id: string) => {
    // ... (same as your existing code)
    if (confirm("Are you sure you want to delete this QR code?")) {
      const { error } = await supabase.from("qr_codes").delete().eq("id", id);
      if (error) { toast.error("Failed to delete QR code"); } else {
        toast.success("QR code deleted");
        fetchQRCodes();
        setSelectedQr(null); // Close sheet if open
      }
    }
  };

  const handleEditUrl = async (id: string) => {
    // ... (same as your existing code)
    if (!editUrl.trim()) { toast.error("Please enter a valid URL"); return; }
    const { error } = await supabase
      .from("qr_codes")
      .update({ destination_url: editUrl, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error("Failed to update URL"); } else {
      toast.success("Destination URL updated successfully");
      setEditingId(null);
      setEditUrl("");
      fetchQRCodes();
      // Update selectedQr data if it's the one being edited
      if(selectedQr && selectedQr.id === id) {
        setSelectedQr(prev => prev ? ({ ...prev, destination_url: editUrl }) : null);
      }
    }
  };

  const handleLogout = async () => {
    // ... (same as your existing code)
    await supabase.auth.signOut();
    navigate("/signin");
  };

  // --- NEW FUNCTION TO HANDLE DOWNLOAD FROM SHEET ---
  const handleSheetDownload = () => {
    if (!qrSheetPreviewRef.current || !selectedQr) {
      toast.error("QR Code preview is not ready.");
      return;
    }
    qrSheetPreviewRef.current.download({
      name: selectedQr.name || "qr-code",
      extension: "png",
    });
    toast.success("QR Code downloaded!");
  };

  const getStatusBadgeVariant = (status: string) : "default" | "secondary" | "destructive" | "outline" => {
    // ... (same as your existing code)
    switch (status) {
      case "active": return "default";
      case "reported": return "destructive";
      case "trial_expired":
      case "paid_expired":
        return "secondary";
      default: return "outline";
    }
  };

  // --- FILTERING LOGIC ---
  const filteredQrCodes = qrCodes
    .filter((qr) => {
      if (filter === "all") return true;
      return qr.type === filter;
    })
    .filter((qr) => {
      if (!searchQuery) return true;
      return (
        qr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.destination_url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  if (loading) {
    // ... (same loading screen)
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Stats calculation
  const staticCount = qrCodes.filter((qr) => qr.type === "static").length;
  const dynamicCount = qrCodes.filter((qr) => qr.type === "dynamic").length;

  // --- RENDER FUNCTIONS FOR GRID/LIST ---
  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredQrCodes.map((qr) => (
        <Card key={qr.id} className="p-6">
          <div className="space-y-4">
            {/* Grid preview - uses SheetTrigger to open sheet */}
            {qr.qr_design && (
              <div
                className="flex justify-center py-4 cursor-pointer"
                onClick={() => setSelectedQr(qr)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedQr(qr);
                }}
             >
                <QRCodePreview
                  type={qr.type}
                  data={qr.type === "dynamic" ? qr.short_url! : qr.destination_url}
                  design={qr.qr_design}
                  width={180}
                  height={180}
                />
              </div>
            )}
            
            {/* ... (rest of your existing grid card layout) ... */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{qr.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{qr.type}</p>
              </div>
              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {qr.type === "dynamic" && (
                    <>
                      <DropdownMenuItem onClick={() => navigate(`/analytics/${qr.id}`)}>
                        <BarChart3 className="mr-2" /> Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingId(qr.id);
                          setEditUrl(qr.destination_url);
                        }}
                      >
                        <Edit className="mr-2" /> Edit URL
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(qr.id)}>
                    <Trash2 className="mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Inline editing for grid */}
            <div className="text-sm space-y-1">
              <p className="text-xs text-muted-foreground">Destination:</p>
              {editingId === qr.id ? (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter new destination URL"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditUrl(qr.id)}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditUrl(""); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm truncate">{qr.destination_url}</p>
              )}
            </div>
            {/* Status and Date */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <Badge variant={getStatusBadgeVariant(qr.status)} className="capitalize">
                {qr.status.replace("_", " ")}
              </Badge>
              <span>{new Date(qr.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderList = () => (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"><Checkbox /></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>QR Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Edited</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Scans</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredQrCodes.map((qr) => (
            <TableRow key={qr.id}>
              <TableCell><Checkbox /></TableCell>
              <TableCell>
                {/* --- OPEN SHEET ON CLICK --- */}
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setSelectedQr(qr)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedQr(qr);
                  }}
                >
                  {qr.qr_design && (
                    <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                      <QRCodePreview
                        type={qr.type}
                        data={qr.type === "dynamic" ? qr.short_url! : qr.destination_url}
                        design={qr.qr_design}
                        width={40}
                        height={40}
                      />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium hover:text-primary">{qr.name}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      {qr.destination_url.length > 30 ? qr.destination_url.substring(0, 30) + "..." : qr.destination_url}
                    </span>
                  </div>
                </div>
              </TableCell>
              {/* ... (rest of the table cells are the same) ... */}
              <TableCell>
                <Badge variant="outline" className="capitalize">{qr.type}</Badge>
              </TableCell>
              <TableCell>{new Date(qr.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                {new Date(qr.updated_at).getTime() !== new Date(qr.created_at).getTime()
                  ? new Date(qr.updated_at).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(qr.status)} className="capitalize">
                  {qr.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/analytics/${qr.id}`)} disabled={qr.type !== "dynamic"}>
                  0 {/* Static scan count for now */}
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {qr.type === "dynamic" && (
                      <>
                        <DropdownMenuItem onClick={() => navigate(`/analytics/${qr.id}`)}>
                          <BarChart3 className="mr-2" /> Analytics
                        </DropdownMenuItem>
                        {/* We use the Sheet's edit button now, but could keep this
                        <DropdownMenuItem onClick={() => { setEditingId(qr.id); setEditUrl(qr.destination_url); }}>
                          <Edit className="mr-2" /> Edit URL
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(qr.id)}>
                      <Trash2 className="mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* --- HEADER --- */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
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

      {/* --- MAIN CONTENT --- */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* ... (Welcome Section, Stats Cards, Tabs, Alert, Toolbar) ... */}
          {/* All these sections are identical to my previous response */}
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My QR Codes</h1>
              <p className="text-muted-foreground">
                Create and manage your QR codes
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => navigate('/moderation')} title="Moderation Dashboard">
                <Shield className="w-5 h-5 mr-2" /> Moderation
              </Button>
              <Button variant="hero" size="lg" onClick={() => navigate('/create')}>
                <Plus className="w-5 h-5 mr-2" /> Create New QR
              </Button>
            </div>
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
            </Card>
          </div>
          {/* Tabs */}
          <div className="flex justify-between items-center">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="static">Static</TabsTrigger>
                <TabsTrigger value="dynamic">Dynamic</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
              <Button variant="outline"><ArrowUpDown className="w-4 h-4 mr-2" /> Sort by: Most recent</Button>
            </div>
          </div>
          {/* Trial Alert Banner */}
          <Alert className="border-amber-500/50 text-amber-700 [&>svg]:text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-semibold">You are using a free trial</AlertTitle>
            <AlertDescription>
              Your dynamic QR codes will expire in 30 days.
              <Button variant="hero" size="sm" className="ml-4 h-7" onClick={() => navigate("/pricing")}>
                Upgrade
              </Button>
            </AlertDescription>
          </Alert>
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or URL..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch id="visits-toggle" />
                <Label htmlFor="visits-toggle" className="text-sm">Visits</Label>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>1 of 1</span>
                <Button variant="outline" size="icon" className="w-8 h-8"><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" className="w-8 h-8"><ChevronRight className="w-4 h-4" /></Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setViewMode("list")} className={cn("w-9 h-9", viewMode === "list" && "bg-muted text-primary")}>
                  <List className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setViewMode("grid")} className={cn("w-9 h-9", viewMode === "grid" && "bg-muted text-primary")}>
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* QR Codes List or Grid */}
          {filteredQrCodes.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No QR codes found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your search for "{searchQuery}" with filter "{filter}" returned no results.
                </p>
                <Button variant="outline" onClick={() => { setSearchQuery(""); setFilter("all"); }}>
                  <X className="w-4 h-4 mr-2" /> Clear Filters
                </Button>
              </div>
            </Card>
          ) : viewMode === "list" ? (
            renderList()
          ) : (
            renderGrid()
          )}
        </div>

        {/* --- QR CODE DETAIL SHEET --- */}
  <Sheet open={!!selectedQr} onOpenChange={(open) => { if (!open) setSelectedQr(null); }}>
          <SheetContent className="sm:max-w-md">
            {selectedQr && (
              <>
                <SheetHeader>
                  <SheetTitle>{selectedQr.name}</SheetTitle>
                  <div className="flex justify-center gap-2 pt-2">
                    <Badge variant="outline" className="capitalize">
                      {selectedQr.type}
                    </Badge>
                    <Badge
                      variant={getStatusBadgeVariant(selectedQr.status)}
                      className="capitalize"
                    >
                      {selectedQr.status.replace("_", " ")}
                    </Badge>
                  </div>
                </SheetHeader>
                
                <div className="py-8 flex flex-col items-center gap-6">
                  <p className="text-sm text-muted-foreground">Scan the QR code</p>
                  <div className="p-4 bg-white rounded-lg">
                    {/* Re-initialize QR code for the sheet to get a ref for downloading */}
                    <SheetQRCodeDownloader
                      qrData={selectedQr}
                      onReady={(instance) => {
                        qrSheetPreviewRef.current = instance;
                      }}
                    />
                  </div>
                  <div className="w-full space-y-2">
                    <p className="text-sm font-medium">Link to QR url here</p>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={
                          selectedQr.type === "dynamic"
                            ? getRedirectUrl(selectedQr.short_url!)
                            : selectedQr.destination_url
                        }
                        className="text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = selectedQr.type === "dynamic" ? getRedirectUrl(selectedQr.short_url!) : selectedQr.destination_url;
                          navigator.clipboard.writeText(url);
                          toast.success("Link copied to clipboard!");
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>

                <SheetFooter className="flex-row justify-center gap-2">
                  <Button
                    variant="hero"
                    onClick={handleSheetDownload}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/create')} // This is just a placeholder, ideally it would go to an edit page
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit QR
                  </Button>
                </SheetFooter>
              </>
            )}
          </SheetContent>
        </Sheet>
      </main>
    </div>
  );
};

// A helper component to re-render the QR code inside the sheet
// This is necessary to get a *new* ref (`qrSheetPreviewRef`) for downloading
const SheetQRCodeDownloader = ({
  qrData,
  onReady,
}: {
  qrData: QRCodeData;
  onReady: (instance: QRCodeStyling) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && qrData) {
      ref.current.innerHTML = "";
      const qrDataString =
        qrData.type === "dynamic"
          ? getRedirectUrl(qrData.short_url!)
          : qrData.destination_url;
      
      const design = qrData.qr_design || {
        dot_color: null,
        background_color: null,
        corner_color: null,
        logo_url: null,
        frame_text: null,
      };

      const options: Partial<QRCodeOptions> = {
        width: 256,
        height: 256,
        type: "svg" as const,
        data: qrDataString,
        dotsOptions: { color: design.dot_color || "#000", type: "rounded" as const },
        backgroundOptions: { color: design.background_color || "#fff" },
        cornersSquareOptions: { color: design.corner_color || design.dot_color || "#000", type: "extra-rounded" as const },
        cornersDotOptions: { color: design.corner_color || design.dot_color || "#000", type: "dot" as const },
        // Always provide imageOptions to satisfy qr-code-styling internal expectations (avoids undefined.hideBackgroundDots error)
        image: design.logo_url || undefined,
        imageOptions: {
          crossOrigin: "anonymous",
          margin: design.logo_url ? 8 : 0,
          hideBackgroundDots: false,
          imageSize: 0.4, // default ratio; ignored if image undefined
        },
      };

      // Add frame text if present
      if (design.frame_text) {
        options.qrOptions = { errorCorrectionLevel: "H" };
        options.imageOptions = {
          ...options.imageOptions,
          margin: 10
        };
      }

  const qrCode = new QRCodeStyling(options);
      qrCode.append(ref.current);
      onReady(qrCode);
    }
  }, [qrData, onReady]);

  return <div ref={ref} />;
};

export default Dashboard;