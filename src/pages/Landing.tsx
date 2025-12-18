import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Shield, Activity } from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl">
            <Globe className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">DebrisTracker</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
          <a href="#orbits" className="text-sm font-medium hover:text-primary transition-colors">Orbits</a>
          <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">About</a>
        </div>
        <Button onClick={() => navigate("/auth")} variant="outline" className="rounded-full px-6">
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary-foreground text-sm font-medium mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-foreground opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-foreground"></span>
            </span>
            Live Tracking Active
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Securing Earth's <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Orbital Future</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Monitor, analyze, and track space debris across LEO, MEO, and GEO orbits. 
            Advanced risk assessment for a safer space environment.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button 
              size="lg" 
              className="rounded-full px-8 h-14 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              onClick={() => navigate("/dashboard")}
            >
              Launch Tracker <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full px-8 h-14 text-lg bg-background/50 backdrop-blur-sm"
            >
              View Documentation
            </Button>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24 w-full px-4">
          <FeatureCard 
            icon={<Globe className="h-6 w-6 text-primary" />}
            title="Multi-Orbit Tracking"
            description="Real-time monitoring across Low, Medium, and Geostationary Earth Orbits."
          />
          <FeatureCard 
            icon={<Shield className="h-6 w-6 text-secondary-foreground" />}
            title="Risk Assessment"
            description="Advanced algorithms to calculate collision probability and risk scores."
          />
          <FeatureCard 
            icon={<Activity className="h-6 w-6 text-accent-foreground" />}
            title="Debris Analytics"
            description="Comprehensive data on mass, velocity, and origin of orbital objects."
          />
        </div>
      </main>
      
      <footer className="relative z-10 py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>© 2024 DebrisTracker. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 text-left elevation-1 hover:elevation-2 transition-all"
    >
      <div className="mb-4 p-3 rounded-2xl bg-background w-fit shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}