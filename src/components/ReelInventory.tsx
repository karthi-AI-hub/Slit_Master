import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, Edit, Trash2, Package, RefreshCw } from "lucide-react";
import { 
  getReels, 
  saveReels, 
  generateReelId, 
  exportToCSV, 
  deleteReel, 
  type ReelInventory as ReelType 
} from "@/lib/storage";
import { Spinner } from "./Spinner";
import { useToast } from "@/hooks/use-toast";

const PAPER_TYPES = [
  "PLA Coated",
  "Bio BPS", 
  "Filobev",
  "Indobev",
  "Indobowl",
  "TNPL",
  "Others"
];

export const ReelInventory = () => {
  const [reels, setReels] = useState<ReelType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<ReelType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    width: "",
    gsm: "",
    weight: "",
    paperType: "",
    notes: "",
    date: new Date().toISOString().split('T')[0]
  });

  const fetchReels = async () => {
    setLoading(true);
    try {
      const data = await getReels();
      setReels(data);
    } catch {
      toast({ title: "Error", description: "Failed to load reels", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReels();
    setRefreshing(false);
  };

  const filteredReels = useMemo(() => {
    return reels.filter(reel =>
      reel.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reel.paperType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reel.notes.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reels, searchQuery]);

  const resetForm = () => {
    setFormData({
      width: "",
      gsm: "",
      weight: "",
      paperType: "",
      notes: "",
      date: new Date().toISOString().split('T')[0]
    });
    setEditingReel(null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!formData.width || !formData.gsm || !formData.weight || !formData.paperType || !formData.date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    setSubmitting(true);
    try {
      let id = editingReel ? editingReel.id : undefined;
      if (!id) {
        id = await generateReelId();
      }
      const reelData: ReelType = {
        id,
        width: parseFloat(formData.width),
        gsm: parseFloat(formData.gsm),
        weight: parseFloat(formData.weight),
        paperType: formData.paperType,
        date: formData.date,
        notes: formData.notes
      };
      let updatedReels;
      if (editingReel) {
        updatedReels = reels.map(reel => reel.id === editingReel.id ? reelData : reel);
      } else {
        updatedReels = [...reels, reelData];
      }
      setReels(updatedReels);
      await saveReels(updatedReels);
      toast({
        title: "Success",
        description: editingReel ? "Reel updated successfully" : "Reel added successfully",
        variant: "default"
      });
      setIsDialogOpen(false);
      resetForm();
    } catch {
      toast({ title: "Error", description: "Failed to save reels", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (reel: ReelType) => {
    setEditingReel(reel);
    setFormData({
      width: reel.width.toString(),
      gsm: reel.gsm.toString(),
      weight: reel.weight.toString(),
      paperType: reel.paperType,
      notes: reel.notes,
      date: reel.date || new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };


  const handleDelete = async (id: string) => {
    try {
      await deleteReel(id);
      toast({
        title: "Success",
        description: "Reel deleted successfully",
        variant: "default"
      });
      await fetchReels();
    } catch {
      toast({ title: "Error", description: "Failed to delete reel", variant: "destructive" });
    }
  };


  // const handleExport = () => {
  //   exportToCSV(reels, 'reel-inventory');
  //   toast({
  //     title: "Export Complete",
  //     description: "Reel inventory exported to CSV",
  //     variant: "default"
  //   });
  // };

  if (loading) {
    return <Spinner label="Loading reels..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reel Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage your paper reel stock</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-4 py-2">
            {reels.length} Reels
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Inventory Management
            </CardTitle>
            <div className="flex gap-2">
              {/* <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button> */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="bg-gradient-primary hover:opacity-90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Reel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingReel ? "Edit Reel" : "Add New Reel"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="width">Width (cm) *</Label>
                        <Input
                          id="width"
                          type="number"
                          step="0.1"
                          value={formData.width}
                          onChange={(e) => setFormData({...formData, width: e.target.value})}
                          placeholder="Enter width"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gsm">GSM *</Label>
                        <Input
                          id="gsm"
                          type="number"
                          value={formData.gsm}
                          onChange={(e) => setFormData({...formData, gsm: e.target.value})}
                          placeholder="Enter GSM"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (kg) *</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        placeholder="Enter weight"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paperType">Paper Type *</Label>
                      <Select value={formData.paperType} onValueChange={(value) => setFormData({...formData, paperType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select paper type" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAPER_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Additional notes..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90" disabled={submitting}>
                        {submitting ? (editingReel ? "Updating..." : "Adding...") : (editingReel ? "Update Reel" : "Add Reel")}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, paper type, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

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
                {filteredReels.map((reel) => (
                  <TableRow key={reel.id}>
                    <TableCell className="font-medium">{reel.id}</TableCell>
                    <TableCell>{reel.width}</TableCell>
                    <TableCell>{reel.gsm}</TableCell>
                    <TableCell>{reel.weight}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{reel.paperType}</Badge>
                    </TableCell>
                    <TableCell>{reel.date}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{reel.notes}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(reel)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(reel.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredReels.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No reels match your search." : "No reels in inventory. Add your first reel to get started."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}