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
  getBottomSizes,
  getSlitResults,
  saveSlitResults,
  exportToCSV, 
  saveReels,
  type SlitPlanResult 
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";


type SlitPlanRow = SlitPlanResult & {
  sideArr: { name: string; width: number }[];
  botArr: { name: string; width: number }[];
};

export const SlitPlanner = () => {
  const [selectedReel, setSelectedReel] = useState("");
  const [selectedFan, setSelectedFan] = useState("");
  const [selectedUPS, setSelectedUPS] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [results, setResults] = useState<SlitPlanRow[]>(() => {
    // Try to load previous results, but fallback to [] if missing sideArr/botArr
    const raw = getSlitResults();
    return Array.isArray(raw) && raw.length > 0 && 'sideArr' in raw[0] && 'botArr' in raw[0]
      ? (raw as SlitPlanRow[])
      : [];
  });
  const { toast } = useToast();

  const reels = getReels();
  const fanSizes = getFanSizes();
  const bottomSizes = getBottomSizes();

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
    switch (upsNumber) {
      case 1: requiredWidth = fan.ups1Width || 0; break;
      case 2: requiredWidth = fan.ups2Width || 0; break;
      case 3: requiredWidth = fan.ups3Width || 0; break;
      case 4: requiredWidth = fan.ups4Width || 0; break;
      default: requiredWidth = 0;
    }
    if (requiredWidth === 0) {
      toast({
        title: "Error",
        description: `${selectedUPS}UPS width not configured for selected fan size`,
        variant: "destructive"
      });
      return;
    }

    const maxSide = 3, maxBottom = 4;
    type SlitPlanRow = SlitPlanResult & {
      sideArr: { name: string; width: number }[];
      botArr: { name: string; width: number }[];
    };
    const newResults: SlitPlanRow[] = [];
    // Side only
    if (selectedVariant === "Side only") {
      for (let i = 1; i <= maxSide; i++) {
        const usedWidth = i * requiredWidth;
        if (usedWidth > reel.width) break;
        const waste = reel.width - usedWidth;
        const efficiency = (usedWidth / reel.width) * 100;
        newResults.push({
          combination: `${i} × ${fan.name} (${selectedUPS}UPS)`,
          usedWidth: parseFloat(usedWidth.toFixed(2)),
          waste: parseFloat(waste.toFixed(2)),
          efficiency: parseFloat(efficiency.toFixed(2)),
          sideArr: Array(i).fill({ name: fan.name, width: requiredWidth }),
          botArr: []
        });
      }
    }
    // Bottom only
    if (selectedVariant === "Bottom only") {
      bottomSizes.forEach(bottom => {
        for (let i = 1; i <= maxBottom; i++) {
          const usedWidth = i * bottom.width;
          if (usedWidth > reel.width) break;
          const waste = reel.width - usedWidth;
          const efficiency = (usedWidth / reel.width) * 100;
          newResults.push({
            combination: `${i} × Bottom (${bottom.name})`,
            usedWidth: parseFloat(usedWidth.toFixed(2)),
            waste: parseFloat(waste.toFixed(2)),
            efficiency: parseFloat(efficiency.toFixed(2)),
            sideArr: [],
            botArr: Array(i).fill({ name: bottom.name, width: bottom.width })
          });
        }
      });
    }
    // Both (mixed)
    if (selectedVariant === "Both") {
      for (let si = 1; si <= maxSide; si++) {
        const sideUsed = si * requiredWidth;
        bottomSizes.forEach(bottom => {
          for (let bi = 1; bi <= maxBottom; bi++) {
            const botUsed = bi * bottom.width;
            const usedWidth = sideUsed + botUsed;
            if (usedWidth > reel.width) continue;
            if (si === 0 && bi === 0) continue;
            const waste = reel.width - usedWidth;
            const efficiency = (usedWidth / reel.width) * 100;
            newResults.push({
              combination: `${si} × ${fan.name} (${selectedUPS}UPS) + ${bi} × Bottom (${bottom.name})`,
              usedWidth: parseFloat(usedWidth.toFixed(2)),
              waste: parseFloat(waste.toFixed(2)),
              efficiency: parseFloat(efficiency.toFixed(2)),
              sideArr: Array(si).fill({ name: fan.name, width: requiredWidth }),
              botArr: Array(bi).fill({ name: bottom.name, width: bottom.width })
            });
          }
        });
      }
    }
    // Uniqueness
    const uniq = new Map<string, SlitPlanRow>();
    newResults.forEach(r => { const k = r.combination + '|' + r.usedWidth; if (!uniq.has(k)) uniq.set(k, r); });
    const finalResults = Array.from(uniq.values()).sort((a, b) => b.efficiency - a.efficiency || a.waste - b.waste);
    setResults(finalResults);
    saveSlitResults(finalResults);
    toast({
      title: "Success",
      description: `Generated ${finalResults.length} slit plan combinations`,
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

  // Create child reels from a result
  const handleCreateChildReels = (result: {
    sideArr: { name: string; width: number }[];
    botArr: { name: string; width: number }[];
  }) => {
    const reel = reels.find(r => r.id === selectedReel);
    if (!reel) return;
    const updatedReels = reels.filter(r => r.id !== reel.id);
    const pWidth = reel.width, pWeight = reel.weight;
    function pushChild(w: number, note: string) {
      const childWeight = pWeight ? +(pWeight * (w / pWidth)).toFixed(3) : 0;
      updatedReels.push({
        id: `R${String(updatedReels.length + 1).padStart(3, '0')}`,
        width: +w,
        gsm: reel.gsm,
        weight: childWeight,
        paperType: reel.paperType,
        date: new Date().toISOString().slice(0, 10),
        notes: note
      });
    }
    result.sideArr.forEach((s) => pushChild(s.width, `Slit child ${s.name}`));
    result.botArr.forEach((b) => pushChild(b.width, `Slit bottom ${b.name}`));
    saveReels(updatedReels);
    toast({
      title: "Child reels created",
      description: `Created ${result.sideArr.length + result.botArr.length} child reels`,
      variant: "default"
    });
  };

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
                    <TableHead>Actions</TableHead>
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
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleCreateChildReels(result)}>
                          Create Child Reels
                        </Button>
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