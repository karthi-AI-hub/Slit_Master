import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, Edit, Trash2, Package } from "lucide-react";
import { 
  getReels, 
  saveReels, 
  generateReelId, 
  exportToCSV, 
  type ReelInventory as ReelType 
} from "@/lib/storage";
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
  const [reels, setReels] = useState<ReelType[]>(getReels);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<ReelType | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    width: "",
    gsm: "",
    weight: "",
    paperType: "",
    notes: ""
  });

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
      notes: ""
    });
    setEditingReel(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.width || !formData.gsm || !formData.weight || !formData.paperType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const reelData: ReelType = {
      id: editingReel ? editingReel.id : generateReelId(),
      width: parseFloat(formData.width),
      gsm: parseFloat(formData.gsm),
      weight: parseFloat(formData.weight),
      paperType: formData.paperType,
      date: editingReel ? editingReel.date : new Date().toISOString().split('T')[0],
      notes: formData.notes
    };

    let updatedReels;
    if (editingReel) {
      updatedReels = reels.map(reel => reel.id === editingReel.id ? reelData : reel);
      toast({
        title: "Success",
        description: "Reel updated successfully",
        variant: "default"
      });
    } else {
      updatedReels = [...reels, reelData];
      toast({
        title: "Success", 
        description: "Reel added successfully",
        variant: "default"
      });
    }

    setReels(updatedReels);
    saveReels(updatedReels);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (reel: ReelType) => {
    setEditingReel(reel);
    setFormData({
      width: reel.width.toString(),
      gsm: reel.gsm.toString(),
      weight: reel.weight.toString(),
      paperType: reel.paperType,
      notes: reel.notes
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedReels = reels.filter(reel => reel.id !== id);
    setReels(updatedReels);
    saveReels(updatedReels);
    toast({
      title: "Success",
      description: "Reel deleted successfully",
      variant: "default"
    });
  };

  const handleExport = () => {
    exportToCSV(reels, 'reel-inventory');
    toast({
      title: "Export Complete",
      description: "Reel inventory exported to CSV",
      variant: "default"
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reel Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage your paper reel stock</p>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          {reels.length} Reels
        </Badge>
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
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90">
                        {editingReel ? "Update Reel" : "Add Reel"}
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
};