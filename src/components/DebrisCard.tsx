import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Rocket, Satellite, AlertTriangle, Activity, Timer, Flame } from "lucide-react";

interface DebrisProps {
  name: string;
  type: "satellite" | "other";
  orbit: "LEO" | "MEO" | "GEO";
  mass: number;
  size: number;
  shape: string;
  velocity: number;
  riskScore: number;
  origin: string;
  lifeSpan?: number;
  reentryRisk?: number;
}

export function DebrisCard({ data, rank }: { data: DebrisProps, rank?: number }) {
  const isHighRisk = data.riskScore > 70;
  const isMediumRisk = data.riskScore > 40 && data.riskScore <= 70;
  const isCriticalLifeSpan = data.lifeSpan !== undefined && data.lifeSpan < 2;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={`h-full border-none elevation-2 hover:elevation-4 transition-shadow duration-200 bg-card/80 backdrop-blur-sm overflow-hidden ${isCriticalLifeSpan ? 'ring-2 ring-destructive/20' : ''}`}>
        <div className={`h-2 w-full ${isHighRisk ? 'bg-red-500' : isMediumRisk ? 'bg-yellow-500' : 'bg-green-500'}`} />
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${data.type === 'satellite' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary-foreground'}`}>
                {data.type === 'satellite' ? <Satellite className="h-5 w-5" /> : <Rocket className="h-5 w-5" />}
              </div>
              <div>
                <CardTitle className="text-lg font-medium tracking-tight">{data.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{data.origin}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {rank && (
                <Badge variant="outline" className="font-mono text-xs border-destructive/50 text-destructive">
                  {data.reentryRisk !== undefined ? `Re-entry #${rank}` : `Danger Rank #${rank}`}
                </Badge>
              )}
              <Badge variant={isHighRisk ? "destructive" : "secondary"} className="rounded-full px-3 text-[10px]">
                Risk: {data.riskScore}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm mt-2">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Orbit</p>
              <p className="font-medium flex items-center gap-1">
                <Activity className="h-3 w-3" /> {data.orbit}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Mass</p>
              <p className="font-medium">{data.mass.toLocaleString()} kg</p>
            </div>
            
            {data.lifeSpan !== undefined ? (
               <>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Life Span</p>
                  <p className={`font-medium flex items-center gap-1 ${data.lifeSpan < 2 ? 'text-destructive' : ''}`}>
                    <Timer className="h-3 w-3" /> {data.lifeSpan} yrs
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Re-entry Risk</p>
                  <p className={`font-medium flex items-center gap-1 ${data.reentryRisk && data.reentryRisk > 50 ? 'text-destructive' : ''}`}>
                    <Flame className="h-3 w-3" /> {data.reentryRisk}%
                  </p>
                </div>
               </>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Size</p>
                  <p className="font-medium">{data.size} m</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Velocity</p>
                  <p className="font-medium">{data.velocity} km/s</p>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{data.shape}</span>
            </div>
            {isHighRisk && (
              <div className="flex items-center gap-1 text-xs text-destructive font-medium">
                <AlertTriangle className="h-3 w-3" /> High Risk
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}