import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    type: v.optional(v.string()),
    orbit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let results;

    if (args.type) {
      results = await ctx.db
        .query("debris")
        .withIndex("by_type", (q) => q.eq("type", args.type as "satellite" | "other"))
        .collect();
    } else {
      results = await ctx.db.query("debris").collect();
    }

    if (args.orbit) {
      results = results.filter((d) => d.orbit === args.orbit);
    }

    return results.sort((a, b) => b.riskScore - a.riskScore);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("debris").collect();
    
    // Always clear existing data to ensure a fresh, balanced distribution
    // This fixes issues where old data didn't have the correct zone distribution
    for (const doc of all) {
      await ctx.db.delete(doc._id);
    }

    const debrisData = [];
    const orbits = ["LEO", "MEO", "GEO"] as const;
    const types = ["satellite", "other"] as const;
    const shapes = ["Box", "Sphere", "Cylinder", "Fragment", "Cone"];
    const origins = ["USA", "Russia", "China", "ESA", "India", "Japan", "SpaceX", "Intelsat"];

    // Helper to generate random debris
    const generateItem = (latMin: number, latMax: number, longMin: number, longMax: number, prefix: string) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const orbit = orbits[Math.floor(Math.random() * orbits.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const origin = origins[Math.floor(Math.random() * origins.length)];
      
      const mass = Math.floor(Math.random() * 5000) + 10;
      const size = Number((Math.random() * 20 + 0.1).toFixed(2));
      const velocity = Number((Math.random() * 5 + (orbit === "LEO" ? 7 : 3)).toFixed(2));
      
      let altitude = 0;
      if (orbit === "LEO") altitude = Math.floor(Math.random() * 1500) + 160;
      else if (orbit === "MEO") altitude = Math.floor(Math.random() * 30000) + 2000;
      else altitude = Math.floor(Math.random() * 1000) + 35000;

      const riskScore = Math.min(100, Math.round((mass * velocity) / 1000 + (orbit === "LEO" ? 20 : 0) + Math.random() * 20));

      const latitude = Number((Math.random() * (latMax - latMin) + latMin).toFixed(4));
      const longitude = Number((Math.random() * (longMax - longMin) + longMin).toFixed(4));

      // New fields for Life Span feature
      const lifeSpan = Number((Math.random() * 15).toFixed(1)); // 0 to 15 years remaining
      // Higher risk for lower lifespan and LEO orbit
      let reentryRisk = 0;
      if (orbit === "LEO" && lifeSpan < 5) {
        reentryRisk = Math.floor(Math.random() * 60) + 40; // 40-100%
      } else {
        reentryRisk = Math.floor(Math.random() * 30); // 0-30%
      }

      return {
        name: `${prefix}-${Math.floor(Math.random() * 9000) + 1000}`,
        type,
        orbit,
        mass,
        size,
        shape,
        velocity,
        altitude,
        origin,
        riskScore,
        latitude,
        longitude,
        lifeSpan,
        reentryRisk,
      };
    };

    // 1. Generate General Random Data (scattered globally)
    for (let i = 0; i < 500; i++) {
      debrisData.push(generateItem(-90, 90, -180, 180, "Obj"));
    }

    // 2. Explicitly Populate ALL Zones and Bands to ensure no "No objects detected"
    // Quadrants: NE, SE, SW, NW
    const quadrants = [
      { name: "NE", latMult: 1, longMult: 1 }, // Lat > 0, Long > 0
      { name: "SE", latMult: -1, longMult: 1 }, // Lat < 0, Long > 0
      { name: "SW", latMult: -1, longMult: -1 }, // Lat < 0, Long < 0
      { name: "NW", latMult: 1, longMult: -1 }, // Lat > 0, Long < 0
    ];

    const bands = [
      { min: 0, max: 30 },
      { min: 30, max: 60 },
      { min: 60, max: 90 }
    ];

    for (const quad of quadrants) {
      for (const band of bands) {
        // Calculate actual lat/long ranges based on quadrant multipliers
        const latMin = quad.latMult > 0 ? band.min : -band.max;
        const latMax = quad.latMult > 0 ? band.max : -band.min;
        
        const longMin = quad.longMult > 0 ? 0 : -180;
        const longMax = quad.longMult > 0 ? 180 : 0;

        // Add 20 items per specific band in each quadrant
        for (let i = 0; i < 20; i++) {
           debrisData.push(generateItem(latMin, latMax, longMin, longMax, `${quad.name}`));
        }
      }
    }

    // Batch insert
    // Note: In a real app, we'd batch this more carefully, but for < 2000 items this is fine
    await Promise.all(debrisData.map(d => ctx.db.insert("debris", {
        name: d.name,
        type: d.type as "satellite" | "other",
        orbit: d.orbit as "LEO" | "MEO" | "GEO",
        mass: d.mass,
        size: d.size,
        shape: d.shape,
        velocity: d.velocity,
        altitude: d.altitude,
        origin: d.origin,
        riskScore: d.riskScore,
        latitude: d.latitude,
        longitude: d.longitude,
        lifeSpan: d.lifeSpan,
        reentryRisk: d.reentryRisk,
    })));
  },
});