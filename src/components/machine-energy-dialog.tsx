"use client";

import React, { useMemo, useState } from "react";
import { 
  Zap, 
  ChevronDown, 
  LineChart, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  Sparkles,
  Moon,
} from "lucide-react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  ComposedChart,
  Line,
  Area,
  Bar,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartLegendContent, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";

const energyConfig = {
  kwh: { label: "Total kWh", color: "hsl(142, 71%, 45%)" },
  kwhPer1k: { label: "kWh / 1k shots", color: "hsl(262, 83%, 58%)" },
  efficiency: { label: "Efficiency (kWh/kg)", color: "hsl(340, 82%, 52%)" },
  heating: { label: "Heating", color: "hsl(24, 94%, 50%)" },
  production: { label: "Production", color: "hsl(200, 70%, 50%)" },
  idle: { label: "Idle", color: "hsl(220, 9%, 60%)" },
  movingAvg: { label: "Moving Avg", color: "hsl(280, 100%, 70%)" },
};

interface EnergyDataPoint {
  truncated_timestamp: string;
  kwh: number;
  kwhPer1k?: number;
  efficiency?: number;
  heating: number;
  production: number;
  idle: number;
  cost: number;
  shots?: number;
}

interface MachineEnergyDialogProps {
  machineName: string;
  energySeries: EnergyDataPoint[];
  totalKwh: number;
  totalCost: number;
  totals: {
    heating: number;
    production: number;
    idle: number;
  };
}

export function MachineEnergyDialog({
  machineName,
  energySeries,
  totalKwh,
  totalCost,
  totals,
}: MachineEnergyDialogProps) {
  const [energyDialogOpen, setEnergyDialogOpen] = useState(false);
  const [trendsDialogOpen, setTrendsDialogOpen] = useState(false);

  // Format the data for the chart
  const chartData = useMemo(() => {
    return energySeries.map((d) => ({
      ...d,
      date: d.truncated_timestamp
        ? new Date(d.truncated_timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
          })
        : "",
    }));
  }, [energySeries]);

  // Calculate trends data
  const trendsData = useMemo(() => {
    if (energySeries.length < 2) return null;

    const midPoint = Math.floor(energySeries.length / 2);
    const firstHalf = energySeries.slice(0, midPoint);
    const secondHalf = energySeries.slice(midPoint);

    const firstHalfAvg = firstHalf.reduce((s, x) => s + x.kwh, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((s, x) => s + x.kwh, 0) / secondHalf.length;
    const trendPercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    const avgKwh = totalKwh / energySeries.length;
    const maxKwh = Math.max(...energySeries.map(d => d.kwh));
    const minKwh = Math.min(...energySeries.map(d => d.kwh));

    // Calculate moving average (3-period)
    const movingAvgData = chartData.map((d, i) => {
      if (i < 2) return { ...d, movingAvg: d.kwh };
      const avg = (chartData[i].kwh + chartData[i-1].kwh + chartData[i-2].kwh) / 3;
      return { ...d, movingAvg: Number(avg.toFixed(2)) };
    });

    return {
      trendPercent,
      avgKwh,
      maxKwh,
      minKwh,
      movingAvgData,
      isImproving: trendPercent < 0,
    };
  }, [energySeries, chartData, totalKwh]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
            <Zap className="h-3 w-3 text-amber-500" />
            Details
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Energy Monitoring
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Quick stats in dropdown */}
          <div className="px-2 py-2 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{totalKwh.toFixed(1)} kWh</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Est. Cost</span>
              <span className="font-medium text-emerald-600">€{totalCost.toFixed(0)}</span>
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="gap-2 cursor-pointer"
            onClick={() => setEnergyDialogOpen(true)}
          >
            <LineChart className="h-4 w-4" />
            View Full Energy Graph
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="gap-2 cursor-pointer"
            onClick={() => setTrendsDialogOpen(true)}
          >
            <TrendingUp className="h-4 w-4" />
            Energy Trends
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Full Energy Graph Dialog */}
      <Dialog open={energyDialogOpen} onOpenChange={setEnergyDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Energy Monitoring - {machineName}
            </DialogTitle>
            <DialogDescription>
              Detailed energy consumption for this machine (dummy model)
            </DialogDescription>
          </DialogHeader>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="rounded-xl border bg-slate-50 dark:bg-slate-800/50 p-4">
              <div className="text-sm text-muted-foreground">Total Energy</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {totalKwh.toFixed(1)} <span className="text-sm font-medium">kWh</span>
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
                €{totalCost.toFixed(0)}
              </div>
            </div>
          </div>

          {/* Main Energy Chart - Total kWh */}
          <div className="mt-6 rounded-xl border p-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Energy Consumption Over Time
            </h3>
            <ChartContainer config={energyConfig} className="aspect-[2.5/1] h-[350px] w-full">
              <ComposedChart accessibilityLayer data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  interval="preserveStartEnd"
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
              <ComposedChart accessibilityLayer data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  interval="preserveStartEnd"
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
            * Energy data is generated from a dummy model based on shot count
          </div>
        </DialogContent>
      </Dialog>

      {/* Energy Trends Dialog */}
      <Dialog open={trendsDialogOpen} onOpenChange={setTrendsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Energy Trends - {machineName}
            </DialogTitle>
            <DialogDescription>
              Analyze energy consumption patterns
            </DialogDescription>
          </DialogHeader>

          {trendsData && (
            <>
              {/* Trend Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {/* Overall Trend */}
                <div className={`rounded-xl border p-3 ${
                  trendsData.isImproving 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20' 
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {trendsData.isImproving ? (
                      <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <TrendingUp className="h-3.5 w-3.5 text-red-600" />
                    )}
                    Trend
                  </div>
                  <div className={`text-xl font-bold flex items-center gap-1 ${
                    trendsData.isImproving ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {trendsData.isImproving ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    {Math.abs(trendsData.trendPercent).toFixed(1)}%
                  </div>
                </div>

                {/* Average */}
                <div className="rounded-xl border bg-slate-50 dark:bg-slate-800/50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Target className="h-3.5 w-3.5" />
                    Average
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {trendsData.avgKwh.toFixed(2)} <span className="text-xs font-normal">kWh</span>
                  </div>
                </div>

                {/* Peak */}
                <div className="rounded-xl border bg-amber-50 dark:bg-amber-900/20 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    Peak
                  </div>
                  <div className="text-xl font-bold text-amber-600">
                    {trendsData.maxKwh.toFixed(2)} <span className="text-xs font-normal">kWh</span>
                  </div>
                </div>

                {/* Minimum */}
                <div className="rounded-xl border bg-cyan-50 dark:bg-cyan-900/20 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Moon className="h-3.5 w-3.5 text-cyan-600" />
                    Lowest
                  </div>
                  <div className="text-xl font-bold text-cyan-600">
                    {trendsData.minKwh.toFixed(2)} <span className="text-xs font-normal">kWh</span>
                  </div>
                </div>
              </div>

              {/* Moving Average Chart */}
              <div className="mt-5 rounded-xl border p-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Consumption with Moving Average
                </h3>
                <p className="text-xs text-muted-foreground mb-4">3-period moving average shown in purple</p>
                <ChartContainer config={energyConfig} className="aspect-[2.5/1] h-[280px] w-full">
                  <ComposedChart accessibilityLayer data={trendsData.movingAvgData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ReferenceLine y={trendsData.avgKwh} stroke="hsl(220, 9%, 70%)" strokeDasharray="5 5" />
                    <Area dataKey="kwh" type="monotone" stroke={energyConfig.kwh.color} fill={energyConfig.kwh.color} fillOpacity={0.1} />
                    <Line type="monotone" dataKey="movingAvg" stroke={energyConfig.movingAvg.color} strokeWidth={2.5} dot={false} />
                    <Legend content={<ChartLegendContent />} />
                  </ComposedChart>
                </ChartContainer>
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Dashed line = average ({trendsData.avgKwh.toFixed(2)} kWh)
                </div>
              </div>
            </>
          )}

          <div className="mt-4 text-xs text-muted-foreground text-center">
            * Trend compares first half vs second half of selected period
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
