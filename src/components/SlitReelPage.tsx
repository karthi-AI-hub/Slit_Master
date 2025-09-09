import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2 } from "lucide-react";
import { Spinner } from "./Spinner";
import { getSlitReels, deleteSlitReel, type ReelInventory } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function SlitReelPage() {
  const [reels, setReels] = useState<ReelInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchSlitReels = async () => {
    setLoading(true);
    try {
      const data = await getSlitReels();
      setReels(data);
    } catch {
      setReels([]);
      toast({ title: "Error", description: "Failed to load slit reels", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSlitReel(id);
      toast({
        title: "Success",
        description: "Slit reel deleted successfully",
        variant: "default"
      });
      await fetchSlitReels();
    } catch {
      toast({ title: "Error", description: "Failed to delete slit reel", variant: "destructive" });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getSlitReels();
        setReels(data);
      } catch {
        setReels([]);
        toast({ title: "Error", description: "Failed to load slit reels", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [toast]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSlitReels();
    setRefreshing(false);
  };

  if (loading) return <Spinner label="Loading slit reels..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Slit Reel</h1>
          <p className="text-muted-foreground mt-1">Manage slit reel inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-4 py-2">
            {reels.length} Slit Reels
          </Badge>
          <Button size="icon" variant="ghost" onClick={handleRefresh} disabled={refreshing || loading} title="Refresh">
            {refreshing ? (
              <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      <Card className="shadow-elegant border-border/50">
        <CardHeader>
          <CardTitle>Slit Reel Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Width (cm)</TableHead>
                  <TableHead>GSM</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Paper Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reels.length > 0 ? reels.map((reel) => (
                  <TableRow key={reel.id}>
                    <TableCell className="font-medium">{reel.id}</TableCell>
                    <TableCell>{reel.width}</TableCell>
                    <TableCell>{reel.gsm}</TableCell>
                    <TableCell>{reel.weight}</TableCell>
                    <TableCell><Badge variant="outline">{reel.paperType}</Badge></TableCell>
                    <TableCell>{reel.date}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{reel.notes}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(reel.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No slit reels found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
