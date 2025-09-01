import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, Edit, Trash2, Layers, RefreshCw } from "lucide-react";
import { 
  getFanSizes, 
  saveFanSizes, 
  generateFanId, 
  exportToCSV, 
  type FanSize 
} from "@/lib/storage";
import { Spinner } from "./Spinner";
import { useToast } from "@/hooks/use-toast";


export const FanSizes = () => {
  const [fanSizes, setFanSizes] = useState<FanSize[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFan, setEditingFan] = useState<FanSize | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    dieWidth: "",
    dieHeight: "",
    printWidth: "",
    printHeight: "",
    rows: "",
    ups1Width: "",
    ups2Width: "",
    ups3Width: "",
    ups4Width: ""
  });

  const fetchFanSizes = async () => {
    setLoading(true);
    try {
      const data = await getFanSizes();
      setFanSizes(data);
    } catch {
      toast({ title: "Error", description: "Failed to load fan sizes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFanSizes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFanSizes();
    setRefreshing(false);
  };

  const filteredFanSizes = useMemo(() => {
    return fanSizes.filter(fan =>
      fan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fan.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [fanSizes, searchQuery]);

  const resetForm = () => {
    setFormData({
      name: "",
      dieWidth: "",
      dieHeight: "",
      printWidth: "",
      printHeight: "",
      rows: "",
      ups1Width: "",
      ups2Width: "",
      ups3Width: "",
      ups4Width: ""
    });
    setEditingFan(null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // Prevent double submit
    if (!formData.name || !formData.dieWidth || !formData.dieHeight || !formData.printWidth || !formData.printHeight || !formData.rows) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    setSubmitting(true);
    try {
      let id = editingFan ? editingFan.id : undefined;
      if (!id) {
        id = await generateFanId();
      }
      const fanData: FanSize = {
        id,
        name: formData.name,
        dieWidth: parseFloat(formData.dieWidth),
        dieHeight: parseFloat(formData.dieHeight),
        printWidth: parseFloat(formData.printWidth),
        printHeight: parseFloat(formData.printHeight),
        rows: parseInt(formData.rows),
        ups1Width: parseFloat(formData.ups1Width) || 0,
        ups2Width: parseFloat(formData.ups2Width) || 0,
        ups3Width: parseFloat(formData.ups3Width) || 0,
        ups4Width: parseFloat(formData.ups4Width) || 0
      };
      let updatedFanSizes;
      if (editingFan) {
        updatedFanSizes = fanSizes.map(fan => fan.id === editingFan.id ? fanData : fan);
      } else {
        updatedFanSizes = [...fanSizes, fanData];
      }
      setFanSizes(updatedFanSizes);
      await saveFanSizes(updatedFanSizes);
      toast({
        title: "Success",
        description: editingFan ? "Fan size updated successfully" : "Fan size added successfully",
        variant: "default"
      });
      setIsDialogOpen(false);
      resetForm();
    } catch {
      toast({ title: "Error", description: "Failed to save fan sizes", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (fan: FanSize) => {
    setEditingFan(fan);
    setFormData({
      name: fan.name,
      dieWidth: fan.dieWidth.toString(),
      dieHeight: fan.dieHeight.toString(),
      printWidth: fan.printWidth.toString(),
      printHeight: fan.printHeight.toString(),
      rows: fan.rows.toString(),
      ups1Width: fan.ups1Width.toString(),
      ups2Width: fan.ups2Width.toString(),
      ups3Width: fan.ups3Width.toString(),
      ups4Width: fan.ups4Width.toString()
    });
    setIsDialogOpen(true);
  };


  const handleDelete = async (id: string) => {
    const updatedFanSizes = fanSizes.filter(fan => fan.id !== id);
    setFanSizes(updatedFanSizes);
    try {
      await saveFanSizes(updatedFanSizes);
      toast({
        title: "Success",
        description: "Fan size deleted successfully",
        variant: "default"
      });
    } catch {
      toast({ title: "Error", description: "Failed to delete fan size", variant: "destructive" });
    }
  };


  const handleExport = () => {
    exportToCSV(fanSizes, 'fan-sizes');
    toast({
      title: "Export Complete",
      description: "Fan sizes exported to CSV",
      variant: "default"
    });
  };

  if (loading) {
    return <Spinner label="Loading fan sizes..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fan Sizes</h1>
          <p className="text-muted-foreground mt-1">Manage cup fan size specifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-4 py-2">
            {fanSizes.length} Sizes
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
              <Layers className="h-5 w-5 text-primary" />
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
                    Add Fan Size
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingFan ? "Edit Fan Size" : "Add New Fan Size"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., 350ml H60"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dieWidth">Die Width *</Label>
                        <Input
                          id="dieWidth"
                          type="number"
                          step="0.1"
                          value={formData.dieWidth}
                          onChange={(e) => setFormData({...formData, dieWidth: e.target.value})}
                          placeholder="Die width"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dieHeight">Die Height *</Label>
                        <Input
                          id="dieHeight"
                          type="number"
                          step="0.1"
                          value={formData.dieHeight}
                          onChange={(e) => setFormData({...formData, dieHeight: e.target.value})}
                          placeholder="Die height"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="printWidth">Print Width *</Label>
                        <Input
                          id="printWidth"
                          type="number"
                          step="0.1"
                          value={formData.printWidth}
                          onChange={(e) => setFormData({...formData, printWidth: e.target.value})}
                          placeholder="Print width"
                        />
                      </div>
                      <div>
                        <Label htmlFor="printHeight">Print Height *</Label>
                        <Input
                          id="printHeight"
                          type="number"
                          step="0.1"
                          value={formData.printHeight}
                          onChange={(e) => setFormData({...formData, printHeight: e.target.value})}
                          placeholder="Print height"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="rows">Rows *</Label>
                      <Input
                        id="rows"
                        type="number"
                        value={formData.rows}
                        onChange={(e) => setFormData({...formData, rows: e.target.value})}
                        placeholder="Number of rows"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="ups1Width">1UPS Width</Label>
                        <Input
                          id="ups1Width"
                          type="number"
                          step="0.1"
                          value={formData.ups1Width}
                          onChange={(e) => setFormData({...formData, ups1Width: e.target.value})}
                          placeholder="1UPS width"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ups2Width">2UPS Width</Label>
                        <Input
                          id="ups2Width"
                          type="number"
                          step="0.1"
                          value={formData.ups2Width}
                          onChange={(e) => setFormData({...formData, ups2Width: e.target.value})}
                          placeholder="2UPS width"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ups3Width">3UPS Width</Label>
                        <Input
                          id="ups3Width"
                          type="number"
                          step="0.1"
                          value={formData.ups3Width}
                          onChange={(e) => setFormData({...formData, ups3Width: e.target.value})}
                          placeholder="3UPS width"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ups4Width">4UPS Width</Label>
                        <Input
                          id="ups4Width"
                          type="number"
                          step="0.1"
                          value={formData.ups4Width}
                          onChange={(e) => setFormData({...formData, ups4Width: e.target.value})}
                          placeholder="4UPS width"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90" disabled={submitting}>
                        {submitting ? (editingFan ? "Updating..." : "Adding...") : (editingFan ? "Update Fan Size" : "Add Fan Size")}
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
                  <TableHead>Die Size</TableHead>
                  <TableHead>Print Size</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>UPS Widths</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFanSizes.map((fan) => (
                  <TableRow key={fan.id}>
                    <TableCell className="font-medium">{fan.id}</TableCell>
                    <TableCell>{fan.name}</TableCell>
                    <TableCell>{fan.dieWidth} × {fan.dieHeight}</TableCell>
                    <TableCell>{fan.printWidth} × {fan.printHeight}</TableCell>
                    <TableCell>{fan.rows}</TableCell>
                    <TableCell className="text-sm">
                      1UPS: {fan.ups1Width} | 2UPS: {fan.ups2Width} | 3UPS: {fan.ups3Width} | 4UPS: {fan.ups4Width}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(fan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(fan.id)}
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
          
          {filteredFanSizes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No fan sizes match your search." : "No fan sizes configured. Add your first fan size to get started."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}