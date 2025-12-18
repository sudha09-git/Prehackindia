import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DebrisCard } from "@/components/DebrisCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { RefreshCw, Filter, ShieldAlert, Globe, Satellite, Activity, Trophy, Radar, ArrowUpRight, Compass, MapPin, Layers, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const seed = useMutation(api.debris.seed);
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch data based on active tab (simplified for this demo, filtering client side mostly for smooth transitions)
  const allDebris = useQuery(api.debris.list, {});
  
  // Zone Data
  // North to East (NE): Lat > 0, Long > 0
  const zoneNE = allDebris?.filter(d => (d.latitude || 0) >= 0 && (d.longitude || 0) >= 0) || [];
  // East to South (SE): Lat < 0, Long > 0
  const zoneSE = allDebris?.filter(d => (d.latitude || 0) < 0 && (d.longitude || 0) >= 0) || [];
  // South to West (SW): Lat < 0, Long < 0
  const zoneSW = allDebris?.filter(d => (d.latitude || 0) < 0 && (d.longitude || 0) < 0) || [];
  // West to North (NW): Lat > 0, Long < 0
  const zoneNW = allDebris?.filter(d => (d.latitude || 0) >= 0 && (d.longitude || 0) < 0) || [];

  useEffect(() => {
    // Auto-seed if empty OR if specific zones are missing data (fixes "No objects detected" issue)
    if (allDebris) {
      const hasData = allDebris.length > 0;
      const hasZoneData = zoneNE.length > 10 && zoneSE.length > 10 && zoneSW.length > 10 && zoneNW.length > 10;
      
      if (!hasData || !hasZoneData) {
        seed().then(() => toast("Initializing simulation data..."));
      }
    }
  }, [allDebris, seed, zoneNE.length, zoneSE.length, zoneSW.length, zoneNW.length]);

  if (!allDebris) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground animate-pulse">Scanning orbital sectors...</p>
        </div>
      </div>
    );
  }

  const satellites = allDebris.filter(d => d.type === "satellite");
  const otherDebris = allDebris.filter(d => d.type === "other");
  
  const leoDebris = allDebris.filter(d => d.orbit === "LEO");
  const meoDebris = allDebris.filter(d => d.orbit === "MEO");
  const geoDebris = allDebris.filter(d => d.orbit === "GEO");

  // Ranking Data
  const bySize = [...allDebris].sort((a, b) => b.size - a.size).slice(0, 20);
  const byMass = [...allDebris].sort((a, b) => b.mass - a.mass).slice(0, 20);
  const byVelocity = [...allDebris].sort((a, b) => b.velocity - a.velocity).slice(0, 20);
  const byAltitude = [...allDebris].sort((a, b) => b.altitude - a.altitude).slice(0, 20); // Using Altitude for "Orbit" ranking

  // Sort zones by risk for display
  const sortedZoneNE = [...zoneNE].sort((a, b) => b.riskScore - a.riskScore);
  const sortedZoneSE = [...zoneSE].sort((a, b) => b.riskScore - a.riskScore);
  const sortedZoneSW = [...zoneSW].sort((a, b) => b.riskScore - a.riskScore);
  const sortedZoneNW = [...zoneNW].sort((a, b) => b.riskScore - a.riskScore);

  // Life Span Data
  const criticalLifeSpan = allDebris?.filter(d => d.lifeSpan !== undefined && d.lifeSpan < 5).sort((a, b) => (b.reentryRisk || 0) - (a.reentryRisk || 0)) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Orbital Debris Tracker</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => seed().then(() => toast("Simulation Reset"))}>
              <RefreshCw className="h-4 w-4 mr-2" /> Reset Data
            </Button>
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-xs">
              JD
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex items-center gap-4"
          >
            <div className="p-3 bg-primary/20 rounded-2xl text-primary">
              <Satellite className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Global Active Satellites</p>
              <h3 className="text-3xl font-bold">{(9412 + satellites.length).toLocaleString()}</h3>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-secondary/10 border border-secondary/20 rounded-3xl p-6 flex items-center gap-4"
          >
            <div className="p-3 bg-secondary/20 rounded-2xl text-secondary-foreground">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tracked Debris</p>
              <h3 className="text-3xl font-bold">{(34500 + otherDebris.length).toLocaleString()}</h3>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-accent/10 border border-accent/20 rounded-3xl p-6 flex items-center gap-4"
          >
            <div className="p-3 bg-accent/20 rounded-2xl text-accent-foreground">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical Risk Alerts</p>
              <h3 className="text-3xl font-bold">{(1240 + allDebris.filter(d => d.riskScore > 70).length).toLocaleString()}</h3>
            </div>
          </motion.div>
        </section>

        {/* Main Content Tabs */}
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 overflow-x-auto pb-2 sm:pb-0">
            <TabsList className="bg-muted/50 p-1 rounded-full h-auto flex-wrap justify-start">
              <TabsTrigger value="all" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">All Objects</TabsTrigger>
              <TabsTrigger value="satellites" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Satellites</TabsTrigger>
              <TabsTrigger value="debris" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Debris</TabsTrigger>
              <TabsTrigger value="ranked" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                <Trophy className="h-4 w-4" /> Ranked
              </TabsTrigger>
              <TabsTrigger value="zones" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                <Compass className="h-4 w-4" /> Zone Tracking
              </TabsTrigger>
              <TabsTrigger value="lifespan" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                <Timer className="h-4 w-4" /> Life Span
              </TabsTrigger>
              <TabsTrigger value="live" className="rounded-full px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                <Radar className="h-4 w-4 animate-pulse" /> Live Tracking
              </TabsTrigger>
            </TabsList>
            
            {activeTab !== 'live' && activeTab !== 'ranked' && activeTab !== 'zones' && activeTab !== 'lifespan' && (
              <Button variant="outline" className="rounded-full gap-2">
                <Filter className="h-4 w-4" /> Filter Orbit
              </Button>
            )}
          </div>

          <TabsContent value="all" className="space-y-8">
            <OrbitSection title="Low Earth Orbit (LEO)" description="Altitude: 160km - 2,000km" data={leoDebris} />
            <OrbitSection title="Medium Earth Orbit (MEO)" description="Altitude: 2,000km - 35,786km" data={meoDebris} />
            <OrbitSection title="Geostationary Orbit (GEO)" description="Altitude: 35,786km+" data={geoDebris} />
          </TabsContent>
          
          <TabsContent value="satellites" className="space-y-8">
            <OrbitSection title="Satellites in LEO" data={leoDebris.filter(d => d.type === 'satellite')} />
            <OrbitSection title="Satellites in MEO" data={meoDebris.filter(d => d.type === 'satellite')} />
            <OrbitSection title="Satellites in GEO" data={geoDebris.filter(d => d.type === 'satellite')} />
          </TabsContent>
          
          <TabsContent value="debris" className="space-y-8">
            <OrbitSection title="Debris in LEO" data={leoDebris.filter(d => d.type === 'other')} />
            <OrbitSection title="Debris in MEO" data={meoDebris.filter(d => d.type === 'other')} />
            <OrbitSection title="Debris in GEO" data={geoDebris.filter(d => d.type === 'other')} />
          </TabsContent>

          <TabsContent value="ranked" className="space-y-6">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Global Rankings</h2>
                  <p className="text-muted-foreground">Top tracked objects categorized by physical attributes.</p>
                </div>
              </div>
              
              <Tabs defaultValue="size" className="w-full">
                <div className="flex justify-start mb-8 overflow-x-auto pb-2">
                  <TabsList className="bg-muted/50 p-1 rounded-xl h-auto inline-flex">
                    <TabsTrigger value="size" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">By Size</TabsTrigger>
                    <TabsTrigger value="mass" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">By Mass</TabsTrigger>
                    <TabsTrigger value="velocity" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">By Velocity</TabsTrigger>
                    <TabsTrigger value="altitude" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">By Altitude</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="size" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <RankedSection title="Top 20 by Size" description="Largest objects currently tracked in orbit" data={bySize} metric="size" unit="m" />
                </TabsContent>
                <TabsContent value="mass" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <RankedSection title="Top 20 by Mass" description="Heaviest objects currently tracked in orbit" data={byMass} metric="mass" unit="kg" />
                </TabsContent>
                <TabsContent value="velocity" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <RankedSection title="Top 20 by Velocity" description="Fastest moving objects currently tracked" data={byVelocity} metric="velocity" unit="km/s" />
                </TabsContent>
                <TabsContent value="altitude" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <RankedSection title="Top 20 by Altitude" description="Objects in the highest orbits" data={byAltitude} metric="altitude" unit="km" />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="zones" className="space-y-6">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Zone Tracking</h2>
                  <p className="text-muted-foreground">Monitor debris and satellites across specific orbital quadrants and latitude bands.</p>
                </div>
              </div>

              <Tabs defaultValue="ne" className="w-full">
                <div className="flex justify-start mb-8 overflow-x-auto pb-2">
                  <TabsList className="bg-muted/50 p-1 rounded-xl h-auto inline-flex">
                    <TabsTrigger value="ne" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                      <MapPin className="h-4 w-4 text-blue-500" /> North-East Zone
                    </TabsTrigger>
                    <TabsTrigger value="se" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                      <MapPin className="h-4 w-4 text-green-500" /> South-East Zone
                    </TabsTrigger>
                    <TabsTrigger value="sw" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                      <MapPin className="h-4 w-4 text-yellow-500" /> South-West Zone
                    </TabsTrigger>
                    <TabsTrigger value="nw" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                      <MapPin className="h-4 w-4 text-red-500" /> North-West Zone
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="ne" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <ZoneSubTabs data={sortedZoneNE} zoneName="North-East" />
                </TabsContent>
                <TabsContent value="se" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <ZoneSubTabs data={sortedZoneSE} zoneName="South-East" />
                </TabsContent>
                <TabsContent value="sw" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <ZoneSubTabs data={sortedZoneSW} zoneName="South-West" />
                </TabsContent>
                <TabsContent value="nw" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <ZoneSubTabs data={sortedZoneNW} zoneName="North-West" />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="lifespan" className="space-y-6">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">End of Life Monitoring</h2>
                  <p className="text-muted-foreground">Satellites and debris nearing orbital decay with high re-entry risk probability.</p>
                </div>
                <Badge variant="destructive" className="px-4 py-1 text-sm">
                  {criticalLifeSpan.length} Critical Objects
                </Badge>
              </div>

              {criticalLifeSpan.length === 0 ? (
                <div className="p-12 border border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                  <Timer className="h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Critical Objects Detected</h3>
                  <p>All tracked objects are within safe operational parameters.</p>
                  <Button variant="outline" className="mt-4" onClick={() => seed().then(() => toast("Simulation Reset"))}>
                    Run Simulation Again
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {criticalLifeSpan.map((item, index) => (
                    <DebrisCard key={item._id} data={item} rank={index + 1} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="live" className="space-y-8">
            <LiveTrackingView data={allDebris} />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <Button size="lg" className="h-14 w-14 rounded-2xl shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground p-0 elevation-3 hover:elevation-4 transition-all">
          <RefreshCw className="h-6 w-6" onClick={() => seed().then(() => toast("Refreshed Data"))} />
        </Button>
      </div>
    </div>
  );
}

function OrbitSection({ title, description, data }: { title: string, description?: string, data: any[] }) {
  if (data.length === 0) return null;
  
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item) => (
          <DebrisCard key={item._id} data={item} />
        ))}
      </div>
    </section>
  );
}

function ZoneSection({ title, description, data }: { title: string, description: string, data: any[] }) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" /> {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">Sorted by Risk Score (Danger to Earth)</p>
      </div>
      {data.length === 0 ? (
        <div className="p-8 border border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
          <Radar className="h-8 w-8 mb-2 opacity-50" />
          <p>No objects detected in this sector.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.slice(0, 15).map((item, index) => (
            <DebrisCard key={item._id} data={item} rank={index + 1} />
          ))}
        </div>
      )}
    </section>
  );
}

function ZoneSubTabs({ data, zoneName }: { data: any[], zoneName: string }) {
  const low = data.filter(d => Math.abs(d.latitude || 0) < 30);
  const mid = data.filter(d => Math.abs(d.latitude || 0) >= 30 && Math.abs(d.latitude || 0) < 60);
  const high = data.filter(d => Math.abs(d.latitude || 0) >= 60);

  let labels = { low: "0° - 30°", mid: "30° - 60°", high: "60° - 90°" };
  let sectorDesc = { low: "equatorial to low latitudes", mid: "mid-latitudes", high: "high latitudes (polar regions)" };

  if (zoneName === "South-East") {
    labels = { low: "90° - 120°", mid: "120° - 150°", high: "150° - 180°" };
    sectorDesc = { low: "extended sector 1", mid: "extended sector 2", high: "extended sector 3" };
  } else if (zoneName === "South-West") {
    labels = { low: "180° - 210°", mid: "210° - 240°", high: "240° - 270°" };
    sectorDesc = { low: "far sector 1", mid: "far sector 2", high: "far sector 3" };
  } else if (zoneName === "North-West") {
    labels = { low: "270° - 300°", mid: "300° - 330°", high: "330° - 360°" };
    sectorDesc = { low: "closing sector 1", mid: "closing sector 2", high: "closing sector 3" };
  }

  return (
    <Tabs defaultValue="low" className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Latitude Bands:</div>
        <TabsList className="bg-muted/30 p-1 rounded-lg h-auto inline-flex">
          <TabsTrigger value="low" className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            {labels.low}
          </TabsTrigger>
          <TabsTrigger value="mid" className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            {labels.mid}
          </TabsTrigger>
          <TabsTrigger value="high" className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            {labels.high}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="low" className="mt-0 animate-in fade-in-50 slide-in-from-left-2 duration-300">
        <ZoneSection 
          title={`${zoneName} (${labels.low})`} 
          description={`Objects in the ${zoneName} quadrant within ${sectorDesc.low}.`} 
          data={low} 
        />
      </TabsContent>
      <TabsContent value="mid" className="mt-0 animate-in fade-in-50 slide-in-from-left-2 duration-300">
        <ZoneSection 
          title={`${zoneName} (${labels.mid})`} 
          description={`Objects in the ${zoneName} quadrant within ${sectorDesc.mid}.`} 
          data={mid} 
        />
      </TabsContent>
      <TabsContent value="high" className="mt-0 animate-in fade-in-50 slide-in-from-left-2 duration-300">
        <ZoneSection 
          title={`${zoneName} (${labels.high})`} 
          description={`Objects in the ${zoneName} quadrant within ${sectorDesc.high}.`} 
          data={high} 
        />
      </TabsContent>
    </Tabs>
  );
}

function RankedSection({ title, description, data, metric, unit }: { title: string, description: string, data: any[], metric: string, unit: string }) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" /> {title}
        </h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((item, index) => (
          <Card key={item._id} className="border-none bg-card/50 hover:bg-card transition-colors">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <Badge variant="outline" className="font-mono">#{index + 1}</Badge>
              <Badge className={item.type === 'satellite' ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-secondary/20 text-secondary-foreground hover:bg-secondary/30'}>
                {item.type}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-lg truncate" title={item.name}>{item.name}</div>
              <div className="text-sm text-muted-foreground mb-2">{item.origin}</div>
              <div className="flex items-end justify-between mt-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{metric}</div>
                <div className="text-xl font-bold text-primary">
                  {item[metric].toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function LiveTrackingView({ data }: { data: any[] }) {
  // Simulate live updates
  const [activeObject, setActiveObject] = useState<any>(data[0]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const randomObj = data[Math.floor(Math.random() * data.length)];
      setActiveObject(randomObj);
    }, 3000);
    return () => clearInterval(interval);
  }, [data]);

  if (!activeObject) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
      <div className="lg:col-span-2 bg-black/90 rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-center">
        {/* Simulated Map Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
          <div className="grid grid-cols-12 grid-rows-6 h-full w-full">
            {Array.from({ length: 72 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-white/5" />
            ))}
          </div>
        </div>
        
        {/* Earth Representation */}
        <div className="relative z-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl animate-pulse" />
        <div className="relative z-10 h-48 w-48 rounded-full bg-gradient-to-br from-blue-500 to-blue-900 shadow-[0_0_50px_rgba(59,130,246,0.5)] flex items-center justify-center">
          <Globe className="h-32 w-32 text-blue-300/50" />
        </div>

        {/* Orbiting Objects Animation */}
        <div className="absolute inset-0 z-20">
           {data.slice(0, 15).map((_, i) => (
             <motion.div
               key={i}
               className="absolute h-2 w-2 bg-white rounded-full shadow-[0_0_10px_white]"
               animate={{
                 x: [Math.random() * 800 - 400, Math.random() * 800 - 400],
                 y: [Math.random() * 600 - 300, Math.random() * 600 - 300],
                 opacity: [0.2, 1, 0.2],
                 scale: [0.5, 1.5, 0.5],
               }}
               transition={{
                 duration: Math.random() * 10 + 5,
                 repeat: Infinity,
                 ease: "linear",
               }}
               style={{
                 left: "50%",
                 top: "50%",
               }}
             />
           ))}
        </div>

        {/* Active Object Indicator */}
        <div className="absolute top-8 left-8 z-30 bg-black/50 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest">Live Feed</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{activeObject.name}</h3>
          <p className="text-white/60 text-sm">{activeObject.orbit} Orbit • {activeObject.altitude} km</p>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="h-full border-none bg-card/30 backdrop-blur-sm flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-primary" /> Tracking Data
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Velocity</span>
                <span className="font-mono font-bold">{activeObject.velocity} km/s</span>
              </div>
              <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(activeObject.velocity / 15) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Risk Probability</span>
                <span className={`font-mono font-bold ${activeObject.riskScore > 70 ? 'text-red-500' : 'text-green-500'}`}>
                  {activeObject.riskScore}%
                </span>
              </div>
              <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${activeObject.riskScore > 70 ? 'bg-red-500' : 'bg-green-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${activeObject.riskScore}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-background/50 p-3 rounded-xl">
                <div className="text-xs text-muted-foreground mb-1">Mass</div>
                <div className="font-bold">{activeObject.mass} kg</div>
              </div>
              <div className="bg-background/50 p-3 rounded-xl">
                <div className="text-xs text-muted-foreground mb-1">Size</div>
                <div className="font-bold">{activeObject.size} m</div>
              </div>
              <div className="bg-background/50 p-3 rounded-xl">
                <div className="text-xs text-muted-foreground mb-1">Origin</div>
                <div className="font-bold">{activeObject.origin}</div>
              </div>
              <div className="bg-background/50 p-3 rounded-xl">
                <div className="text-xs text-muted-foreground mb-1">Shape</div>
                <div className="font-bold">{activeObject.shape}</div>
              </div>
            </div>

            <Button className="w-full mt-auto group" variant="outline">
              View Full Telemetry <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}