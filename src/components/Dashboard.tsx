import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Layers, 
  Circle, 
  TrendingUp, 
  Weight, 
  BarChart3 
} from "lucide-react";
import { getReels, getFanSizes, getBottomSizes } from "@/lib/storage";
import { useMemo } from "react";

export const Dashboard = () => {
  const reels = getReels();
  const fanSizes = getFanSizes();
  const bottomSizes = getBottomSizes();

  const stats = useMemo(() => {
    const totalWeight = reels.reduce((sum, reel) => sum + reel.weight, 0);
    const avgGSM = reels.length > 0 ? reels.reduce((sum, reel) => sum + reel.gsm, 0) / reels.length : 0;
    const paperTypes = [...new Set(reels.map(reel => reel.paperType))];
    
    return {
      totalReels: reels.length,
      totalWeight: totalWeight.toFixed(2),
      avgGSM: avgGSM.toFixed(0),
      paperTypes: paperTypes.length,
      fanSizes: fanSizes.length,
      bottomSizes: bottomSizes.length
    };
  }, [reels, fanSizes, bottomSizes]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your manufacturing operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-md border-border/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Total Reels
            </CardTitle>
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{stats.totalReels}</div>
            <p className="text-sm text-muted-foreground">
              In inventory
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Total Weight
            </CardTitle>
            <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Weight className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{stats.totalWeight} kg</div>
            <p className="text-sm text-muted-foreground">
              Paper inventory
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Average GSM
            </CardTitle>
            <div className="h-10 w-10 bg-success/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{stats.avgGSM}</div>
            <p className="text-sm text-muted-foreground">
              Paper thickness
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Paper Types
            </CardTitle>
            <div className="h-10 w-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Layers className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{stats.paperTypes}</div>
            <p className="text-sm text-muted-foreground">
              Different varieties
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Fan Sizes
            </CardTitle>
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-light" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{stats.fanSizes}</div>
            <p className="text-sm text-muted-foreground">
              Configured sizes
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Bottom Sizes
            </CardTitle>
            <div className="h-10 w-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <Circle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{stats.bottomSizes}</div>
            <p className="text-sm text-muted-foreground">
              Available options
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};