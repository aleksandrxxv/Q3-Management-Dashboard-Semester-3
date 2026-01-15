"use client";

import React, { useMemo, useState } from "react";
import { Zap } from "lucide-react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  ComposedChart,
  Line,
  Area,
  Bar,
  Legend,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartLegendContent, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";

const energyConfig = {
  kwh: { label: "Total kWh", color: "hsl(142, 71%, 45%)" },
  heating: { label: "Heating", color: "hsl(24, 94%, 50%)" },
  production: { label: "Production", color: "hsl(200, 70%, 50%)" },
  idle: { label: "Idle", color: "hsl(220, 9%, 60%)" },
};

// Generate dummy energy monitoring data over time
function generateEnergyData() {
  const data = [];
  const startDate = new Date(2020, 8, 1); // September 1, 2020
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Simulate varying energy consumption patterns
    const baseProduction = 8 + Math.random() * 12;
    const heating = 3 + Math.random() * 4 + (i % 7 === 0 ? 2 : 0); // Higher on weekly cycles
    const idle = 1.5 + Math.random() * 2;
    const production = baseProduction * (1 + Math.sin(i / 5) * 0.3);
    
    const totalKwh = heating + production + idle;
    
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: date.toISOString(),
      heating: Number(heating.toFixed(2)),
      production: Number(production.toFixed(2)),
      idle: Number(idle.toFixed(2)),
      kwh: Number(totalKwh.toFixed(2)),
    });
  }
  
  return data;
}

export function EnergyMonitoringDialog() {
  const [open, setOpen] = useState(false);
  
  const energyData = useMemo(() => generateEnergyData(), []);
  
  const totals = useMemo(() => {
    const heating = energyData.reduce((sum, d) => sum + d.heating, 0);
    const production = energyData.reduce((sum, d) => sum + d.production, 0);
    const idle = energyData.reduce((sum, d) => sum + d.idle, 0);
    const totalKwh = heating + production + idle;
    const estimatedCost = totalKwh * 0.26; // €0.26 per kWh
    
    return { heating, production, idle, totalKwh, estimatedCost };
  }, [energyData]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Energy Monitoring
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Energy Monitoring Overview
          </DialogTitle>
          <DialogDescription>
            Energy consumption across all machines over the past 30 days (dummy data)
          </DialogDescription>
        </DialogHeader>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="rounded-xl border bg-slate-50 dark:bg-slate-800/50 p-4">
            <div className="text-sm text-muted-foreground">Total Energy</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {totals.totalKwh.toFixed(1)} <span className="text-sm font-medium">kWh</span>
            </div>
          </div>
          <div className="rounded-xl border bg-orange-50 dark:bg-orange-900/20 p-4">
            <div className="text-sm text-muted-foreground">Heating</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {totals.heating.toFixed(1)} <span className="text-sm font-medium">kWh</span>
            </div>
          </div>
          <div className="rounded-xl border bg-blue-50 dark:bg-blue-900/20 p-4">
            <div className="text-sm text-muted-foreground">Production</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totals.production.toFixed(1)} <span className="text-sm font-medium">kWh</span>
            </div>
          </div>
          <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 p-4">
            <div className="text-sm text-muted-foreground">Est. Cost</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              €{totals.estimatedCost.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Main Energy Chart */}
        <div className="mt-6 rounded-xl border p-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Energy Consumption Over Time
          </h3>
          <ChartContainer config={energyConfig} className="aspect-[2.5/1] h-[350px] w-full">
            <ComposedChart accessibilityLayer data={energyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                label={{ value: "kWh", angle: -90, position: "insideLeft" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="kwh"
                type="monotone"
                stroke={energyConfig.kwh.color}
                fill={energyConfig.kwh.color}
                fillOpacity={0.1}
              />
              <Line
                type="monotone"
                dataKey="kwh"
                stroke={energyConfig.kwh.color}
                strokeWidth={2}
                dot={false}
              />
              <Legend content={<ChartLegendContent />} />
            </ComposedChart>
          </ChartContainer>
        </div>

        {/* Breakdown Chart */}
        <div className="mt-4 rounded-xl border p-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Energy Breakdown by Category
          </h3>
          <ChartContainer config={energyConfig} className="aspect-[2.5/1] h-[300px] w-full">
            <ComposedChart accessibilityLayer data={energyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                label={{ value: "kWh", angle: -90, position: "insideLeft" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="heating"
                stackId="a"
                fill={energyConfig.heating.color}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="production"
                stackId="a"
                fill={energyConfig.production.color}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="idle"
                stackId="a"
                fill={energyConfig.idle.color}
                radius={[4, 4, 0, 0]}
              />
              <Legend content={<ChartLegendContent />} />
            </ComposedChart>
          </ChartContainer>
        </div>

        {/* Footer note */}
        <div className="mt-4 text-xs text-muted-foreground text-center">
          * This data is generated from a dummy model for demonstration purposes
        </div>
      </DialogContent>
    </Dialog>
  );
}
