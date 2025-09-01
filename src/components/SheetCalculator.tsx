import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calculator, ChevronDown, Save, Download, Trash2 } from "lucide-react";
import { 
  getReels,
  getSheetPresets,
  saveSheetPresets,
  exportToCSV,
  type SheetCalculationPreset 
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface CalculationResult {
  totalSheets: number;
  netPaperArea: number;
  weightPerSheet: number;
  calculationDetails: {
    originalArea: number;
    coreArea: number;
    wastedArea: number;
    usableArea: number;
    sheetArea: number;
  };
}

export const SheetCalculator = () => {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [lengthUnit, setLengthUnit] = useState("cm");
  const [widthUnit, setWidthUnit] = useState("cm");
  const [selectedReel, setSelectedReel] = useState("");
  const [reelWeight, setReelWeight] = useState("");
  const [coreWeight, setCoreWeight] = useState("5");
  const [gsm, setGsm] = useState("");
  const [wastage, setWastage] = useState("2");
  const [roundingMode, setRoundingMode] = useState("Down");
  const [presets, setPresets] = useState<SheetCalculationPreset[]>(getSheetPresets);
  const [presetName, setPresetName] = useState("");
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const reels = getReels();

  const convertToMeters = (value: number, unit: string): number => {
    switch (unit) {
      case "mm": return value / 1000;
      case "cm": return value / 100;
      case "m": return value;
      default: return value;
    }
  };

  const calculationResult = useMemo((): CalculationResult | null => {
    if (!length || !width || !reelWeight || !gsm) return null;

    const lengthM = convertToMeters(parseFloat(length), lengthUnit);
    const widthM = convertToMeters(parseFloat(width), widthUnit);
    const reelWeightKg = parseFloat(reelWeight);
    const coreWeightKg = parseFloat(coreWeight);
    const gsmValue = parseFloat(gsm);
    const wastagePercent = parseFloat(wastage);

    const netPaperWeight = Math.max(reelWeightKg - Math.max(coreWeightKg, 0), 0); // kg
    const originalArea = (netPaperWeight * 1000) / gsmValue; // m²
    const wastedArea = (originalArea * wastagePercent) / 100;
    const usableArea = originalArea - wastedArea;
    const sheetArea = lengthM * widthM; // m²

    let totalSheets = usableArea / sheetArea;
    switch (roundingMode) {
      case "Down":
        totalSheets = Math.floor(totalSheets);
        break;
      case "Nearest":
        totalSheets = Math.round(totalSheets);
        break;
      case "Up":
        totalSheets = Math.ceil(totalSheets);
        break;
    }

    const w_per_sheet_g = gsmValue * sheetArea;

    return {
      totalSheets,
      netPaperArea: usableArea,
      weightPerSheet: w_per_sheet_g,
      calculationDetails: {
        originalArea,
        coreArea: 0,
        wastedArea,
        usableArea,
        sheetArea
      }
    };
  }, [length, width, lengthUnit, widthUnit, reelWeight, coreWeight, gsm, wastage, roundingMode]);

  const handleReelSelection = (reelId: string) => {
    const reel = reels.find(r => r.id === reelId);
    if (reel) {
      setReelWeight(reel.weight.toString());
      setGsm(reel.gsm.toString());
    }
  };

  const savePreset = () => {
    if (!presetName) {
      toast({
        title: "Validation Error",
        description: "Please enter a preset name",
        variant: "destructive"
      });
      return;
    }

    const preset: SheetCalculationPreset = {
      id: Date.now().toString(),
      name: presetName,
      length: parseFloat(length) || 0,
      width: parseFloat(width) || 0,
      lengthUnit,
      widthUnit,
      reelWeight: parseFloat(reelWeight) || 0,
      coreWeight: parseFloat(coreWeight) || 5,
      gsm: parseFloat(gsm) || 0,
      wastage: parseFloat(wastage) || 2,
      roundingMode
    };

    const updatedPresets = [...presets, preset];
    setPresets(updatedPresets);
    saveSheetPresets(updatedPresets);
    setIsPresetDialogOpen(false);
    setPresetName("");
    
    toast({
      title: "Success",
      description: "Calculation preset saved",
      variant: "default"
    });
  };

  const loadPreset = (preset: SheetCalculationPreset) => {
    setLength(preset.length.toString());
    setWidth(preset.width.toString());
    setLengthUnit(preset.lengthUnit);
    setWidthUnit(preset.widthUnit);
    setReelWeight(preset.reelWeight.toString());
    setCoreWeight(preset.coreWeight.toString());
    setGsm(preset.gsm.toString());
    setWastage(preset.wastage.toString());
    setRoundingMode(preset.roundingMode);
    
    toast({
      title: "Preset Loaded",
      description: `Loaded preset: ${preset.name}`,
      variant: "default"
    });
  };

  const deletePreset = (id: string) => {
    const updatedPresets = presets.filter(p => p.id !== id);
    setPresets(updatedPresets);
    saveSheetPresets(updatedPresets);
    
    toast({
      title: "Success",
      description: "Preset deleted",
      variant: "default"
    });
  };

  const exportResults = () => {
    if (!calculationResult) {
      toast({
        title: "No Data",
        description: "No calculation results to export",
        variant: "destructive"
      });
      return;
    }

    const exportData = [
      {
        Length: `${length} ${lengthUnit}`,
        Width: `${width} ${widthUnit}`,
        ReelWeight: `${reelWeight} kg`,
        CoreWeight: `${coreWeight} kg`,
        GSM: gsm,
        Wastage: `${wastage}%`,
        RoundingMode: roundingMode,
        TotalSheets: calculationResult.totalSheets,
        NetPaperArea: `${calculationResult.netPaperArea.toFixed(4)} m²`,
        WeightPerSheet: `${calculationResult.weightPerSheet.toFixed(3)} g`
      }
    ];

    exportToCSV(exportData, 'sheet-calculation-results');
    toast({
      title: "Export Complete",
      description: "Calculation results exported to CSV",
      variant: "default"
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sheet Calculator</h1>
          <p className="text-muted-foreground mt-1">Calculate paper sheets from reel specifications</p>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          {presets.length} Presets
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-elegant border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Calculation Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="length">Length *</Label>
                <div className="flex gap-2">
                  <Input
                    id="length"
                    type="number"
                    step="0.1"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="Length"
                  />
                  <Select value={lengthUnit} onValueChange={setLengthUnit}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm">mm</SelectItem>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="width">Width *</Label>
                <div className="flex gap-2">
                  <Input
                    id="width"
                    type="number"
                    step="0.1"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="Width"
                  />
                  <Select value={widthUnit} onValueChange={setWidthUnit}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm">mm</SelectItem>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="reel">Select Reel (Optional)</Label>
              <Select value={selectedReel} onValueChange={(value) => {
                setSelectedReel(value);
                if (value) handleReelSelection(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a reel to auto-fill" />
                </SelectTrigger>
                <SelectContent>
                  {reels.map(reel => (
                    <SelectItem key={reel.id} value={reel.id}>
                      {reel.id} - {reel.weight}kg, {reel.gsm}GSM
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reelWeight">Reel Weight (kg) *</Label>
                <Input
                  id="reelWeight"
                  type="number"
                  step="0.1"
                  value={reelWeight}
                  onChange={(e) => setReelWeight(e.target.value)}
                  placeholder="Reel weight"
                />
              </div>
              <div>
                <Label htmlFor="coreWeight">Core Weight (kg)</Label>
                <Input
                  id="coreWeight"
                  type="number"
                  step="0.1"
                  value={coreWeight}
                  onChange={(e) => setCoreWeight(e.target.value)}
                  placeholder="Core weight"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gsm">GSM *</Label>
                <Input
                  id="gsm"
                  type="number"
                  value={gsm}
                  onChange={(e) => setGsm(e.target.value)}
                  placeholder="GSM value"
                />
              </div>
              <div>
                <Label htmlFor="wastage">Wastage (%)</Label>
                <Input
                  id="wastage"
                  type="number"
                  step="0.1"
                  value={wastage}
                  onChange={(e) => setWastage(e.target.value)}
                  placeholder="Wastage %"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="rounding">Rounding Mode</Label>
              <Select value={roundingMode} onValueChange={setRoundingMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Down">Down</SelectItem>
                  <SelectItem value="Nearest">Nearest</SelectItem>
                  <SelectItem value="Up">Up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Dialog open={isPresetDialogOpen} onOpenChange={setIsPresetDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Save Preset
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Calculation Preset</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="presetName">Preset Name</Label>
                      <Input
                        id="presetName"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="Enter preset name"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={savePreset} className="flex-1">Save</Button>
                      <Button variant="outline" onClick={() => setIsPresetDialogOpen(false)}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={exportResults} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-border/50">
          <CardHeader>
            <CardTitle>Calculation Results</CardTitle>
          </CardHeader>
          <CardContent>
            {calculationResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{calculationResult.totalSheets.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Sheets</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-accent/10 rounded-lg text-center">
                      <div className="text-xl font-semibold text-accent-foreground">{calculationResult.netPaperArea.toFixed(4)}</div>
                      <div className="text-xs text-muted-foreground">Net Area (m²)</div>
                    </div>
                    <div className="p-3 bg-success/10 rounded-lg text-center">
                      <div className="text-xl font-semibold text-success">{calculationResult.weightPerSheet.toFixed(3)}</div>
                      <div className="text-xs text-muted-foreground">Weight/Sheet (g)</div>
                    </div>
                  </div>
                </div>

                <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                      {showDetails ? 'Hide' : 'Show'} Calculation Details
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-4">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Original Area:</span>
                        <span>{calculationResult.calculationDetails.originalArea.toFixed(4)} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wasted Area:</span>
                        <span>{calculationResult.calculationDetails.wastedArea.toFixed(4)} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usable Area:</span>
                        <span>{calculationResult.calculationDetails.usableArea.toFixed(4)} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sheet Area:</span>
                        <span>{calculationResult.calculationDetails.sheetArea.toFixed(4)} m²</span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Fill in the required fields to see calculation results
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {presets.length > 0 && (
        <Card className="shadow-elegant border-border/50">
          <CardHeader>
            <CardTitle>Saved Presets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {presets.map((preset) => (
                <div key={preset.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{preset.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePreset(preset.id)}
                      className="text-destructive hover:text-destructive h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>{preset.length}{preset.lengthUnit} × {preset.width}{preset.widthUnit}</div>
                    <div>{preset.reelWeight}kg, {preset.gsm}GSM</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPreset(preset)}
                    className="w-full"
                  >
                    Load Preset
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};