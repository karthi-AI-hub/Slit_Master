import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Scissors, Download, BarChart3, Trash2 } from "lucide-react";
import { 
  getReels, 
  getFanSizes, 
  getSlitResults,
  saveSlitResults,
  exportToCSV, 
  type SlitPlanResult 
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export const SlitPlanner = () => {
  const [selectedReel, setSelectedReel] = useState("");
  const [selectedFan, setSelectedFan] = useState("");
  const [selectedUPS, setSelectedUPS] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [results, setResults] = useState<SlitPlanResult[]>(getSlitResults);
  const { toast } = useToast();

  const reels = getReels();
  const fanSizes = getFanSizes();

  const generateSlitPlan = () => {
    if (!selectedReel || !selectedFan || !selectedUPS || !selectedVariant) {
      toast({
        title: "Validation Error",
        description: "Please select all required fields",
        variant: "destructive"
      });
      return;
    }

    const reel = reels.find(r => r.id === selectedReel);
    const fan = fanSizes.find(f => f.id === selectedFan);
    
    if (!reel || !fan) return;

    const upsNumber = parseInt(selectedUPS);
    let requiredWidth = 0;

    // Calculate required width based on UPS
    switch (upsNumber) {
      case 1:
        requiredWidth = fan.ups1Width;
        break;
      case 2:
        requiredWidth = fan.ups2Width;
        break;
      case 3:
        requiredWidth = fan.ups3Width;
        break;
      case 4:
        requiredWidth = fan.ups4Width;
        break;
    }

    if (requiredWidth === 0) {
      toast({
        title: "Error",
        description: `${selectedUPS}UPS width not configured for selected fan size`,
        variant: "destructive"
      });
      return;
    }

    // Calculate combinations based on variant
    const newResults: SlitPlanResult[] = [];
    
    if (selectedVariant === "Side only" || selectedVariant === "Both") {
      const possibleCombinations = Math.floor(reel.width / requiredWidth);
      for (let i = 1; i <= possibleCombinations; i++) {
        const usedWidth = i * requiredWidth;
        const waste = reel.width - usedWidth;
        const efficiency = (usedWidth / reel.width) * 100;
        
        newResults.push({
          combination: `${i} × ${fan.name} (${selectedUPS}UPS)`,
          usedWidth: parseFloat(usedWidth.toFixed(2)),
          waste: parseFloat(waste.toFixed(2)),
          efficiency: parseFloat(efficiency.toFixed(2))
        });
      }
    }

    if (selectedVariant === "Bottom only" || selectedVariant === "Both") {
      // For bottom planning, we need bottom sizes
      // This is a simplified implementation - in real scenario you'd combine with bottom sizes
      const bottomWidth = fan.dieWidth; // Simplified assumption
      const possibleBottoms = Math.floor(reel.width / bottomWidth);
      
      for (let i = 1; i <= possibleBottoms; i++) {
        const usedWidth = i * bottomWidth;
        const waste = reel.width - usedWidth;
        const efficiency = (usedWidth / reel.width) * 100;
        
        newResults.push({
          combination: `${i} × Bottom for ${fan.name}`,
          usedWidth: parseFloat(usedWidth.toFixed(2)),
          waste: parseFloat(waste.toFixed(2)),
          efficiency: parseFloat(efficiency.toFixed(2))
        });
      }
    }

    // Sort by efficiency (highest first)
    newResults.sort((a, b) => b.efficiency - a.efficiency);
    
    setResults(newResults);
    saveSlitResults(newResults);
    
    toast({
      title: "Success",
      description: `Generated ${newResults.length} slit plan combinations`,
      variant: "default"
    });
  };

  const clearResults = () => {
    setResults([]);
    saveSlitResults([]);
    toast({
      title: "Cleared",
      description: "Slit plan results cleared",
      variant: "default"
    });
  };

  const handleExport = () => {
    if (results.length === 0) {
      toast({
        title: "No Data",
        description: "No results to export",
        variant: "destructive"
      });
      return;
    }
    
    exportToCSV(results, 'slit-plan-results');
    toast({
      title: "Export Complete",
      description: "Slit plan results exported to CSV",
      variant: "default"
    });
  };

  const bestEfficiency = useMemo(() => {
    return results.length > 0 ? Math.max(...results.map(r => r.efficiency)) : 0;
  }, [results]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Slit Planner</h1>
          <p className="text-muted-foreground mt-1">Optimize paper cutting plans for maximum efficiency</p>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          {results.length} Plans
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-elegant border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-primary" />
              Planning Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reel">Select Parent Reel *</Label>
              <Select value={selectedReel} onValueChange={setSelectedReel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a reel" />
                </SelectTrigger>
                <SelectContent>
                  {reels.map(reel => (
                    <SelectItem key={reel.id} value={reel.id}>
                      {reel.id} - {reel.width}cm, {reel.gsm}GSM, {reel.paperType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fan">Select Fan Name *</Label>
              <Select value={selectedFan} onValueChange={setSelectedFan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a fan size" />
                </SelectTrigger>
                <SelectContent>
                  {fanSizes.map(fan => (
                    <SelectItem key={fan.id} value={fan.id}>
                      {fan.name} ({fan.dieWidth}×{fan.dieHeight})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ups">Select UPS *</Label>
              <Select value={selectedUPS} onValueChange={setSelectedUPS}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose UPS count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1UPS</SelectItem>
                  <SelectItem value="2">2UPS</SelectItem>
                  <SelectItem value="3">3UPS</SelectItem>
                  <SelectItem value="4">4UPS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="variant">Select Variant *</Label>
              <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose variant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Side only">Side only</SelectItem>
                  <SelectItem value="Bottom only">Bottom only</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={generateSlitPlan} 
                className="flex-1 bg-gradient-primary hover:opacity-90"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Plan
              </Button>
              <Button 
                onClick={clearResults} 
                variant="outline"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-border/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Efficiency Summary</CardTitle>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-success/10 rounded-lg">
                    <div className="text-2xl font-bold text-success">{bestEfficiency.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Best Efficiency</div>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{results.length}</div>
                    <div className="text-sm text-muted-foreground">Total Plans</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Plans are sorted by efficiency (highest first)
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No slit plans generated yet. Configure parameters and click "Generate Plan" to start.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-elegant border-border/50">
        <CardHeader>
          <CardTitle>Slit Plan Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Combination</TableHead>
                    <TableHead>Used Width (cm)</TableHead>
                    <TableHead>Waste (cm)</TableHead>
                    <TableHead>Efficiency (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{result.combination}</TableCell>
                      <TableCell>{result.usedWidth}</TableCell>
                      <TableCell>{result.waste}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{result.efficiency}%</span>
                          {result.efficiency === bestEfficiency && (
                            <Badge variant="default" className="text-xs bg-success">Best</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No results to display. Generate a slit plan to see optimization results.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};