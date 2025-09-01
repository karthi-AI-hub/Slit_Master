import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, Edit, Trash2, Circle } from "lucide-react";
import { 
  getBottomSizes, 
  saveBottomSizes, 
  generateBottomId, 
  exportToCSV, 
  type BottomSize 
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export const BottomSizes = () => {
  const [bottomSizes, setBottomSizes] = useState<BottomSize[]>(getBottomSizes);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBottom, setEditingBottom] = useState<BottomSize | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    width: ""
  });

  const filteredBottomSizes = useMemo(() => {
    return bottomSizes.filter(bottom =>
      bottom.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bottom.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bottomSizes, searchQuery]);

  const resetForm = () => {
    setFormData({
      name: "",
      width: ""
    });
    setEditingBottom(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.width) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const bottomData: BottomSize = {
      id: editingBottom ? editingBottom.id : generateBottomId(),
      name: formData.name,
      width: parseFloat(formData.width)
    };

    let updatedBottomSizes;
    if (editingBottom) {
      updatedBottomSizes = bottomSizes.map(bottom => bottom.id === editingBottom.id ? bottomData : bottom);
      toast({
        title: "Success",
        description: "Bottom size updated successfully",
        variant: "default"
      });
    } else {
      updatedBottomSizes = [...bottomSizes, bottomData];
      toast({
        title: "Success", 
        description: "Bottom size added successfully",
        variant: "default"
      });
    }

    setBottomSizes(updatedBottomSizes);
    saveBottomSizes(updatedBottomSizes);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (bottom: BottomSize) => {
    setEditingBottom(bottom);
    setFormData({
      name: bottom.name,
      width: bottom.width.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedBottomSizes = bottomSizes.filter(bottom => bottom.id !== id);
    setBottomSizes(updatedBottomSizes);
    saveBottomSizes(updatedBottomSizes);
    toast({
      title: "Success",
      description: "Bottom size deleted successfully",
      variant: "default"
    });
  };

  const handleExport = () => {
    exportToCSV(bottomSizes, 'bottom-sizes');
    toast({
      title: "Export Complete",
      description: "Bottom sizes exported to CSV",
      variant: "default"
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bottom Sizes</h1>
          <p className="text-muted-foreground mt-1">Manage cup bottom size specifications</p>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          {bottomSizes.length} Sizes
        </Badge>
      </div>

      <Card className="shadow-elegant border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Circle className="h-5 w-5 text-primary" />
              Size Management
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
                    Add Bottom Size
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingBottom ? "Edit Bottom Size" : "Add New Bottom Size"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., 90mm"
                      />
                    </div>
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
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90">
                        {editingBottom ? "Update Bottom Size" : "Add Bottom Size"}
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
                placeholder="Search by ID or name..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Width (cm)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBottomSizes.map((bottom) => (
                  <TableRow key={bottom.id}>
                    <TableCell className="font-medium">{bottom.id}</TableCell>
                    <TableCell>{bottom.name}</TableCell>
                    <TableCell>{bottom.width}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(bottom)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(bottom.id)}
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
          
          {filteredBottomSizes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No bottom sizes match your search." : "No bottom sizes configured. Add your first bottom size to get started."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};