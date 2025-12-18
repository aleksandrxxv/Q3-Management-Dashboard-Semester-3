"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    CartesianGrid,
    XAxis,
    YAxis,
    Bar,
    Legend,
    ComposedChart,
    Line,
    Area,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip, // ✅ Recharts native tooltip
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { fetchMachine } from "@/lib/supabase/fetchMachines";
import { fetchChartData } from "@/lib/supabase/fetchMachineTimelines";
import {
    Machine,
    MachineTimeline,
    MoldHistory,
    Notification,
} from "@/types/supabase";
import StatusIndicator from "@/components/timeline/StatusIndicator";
import { SelectStartEndDate } from "@/components/SelectStartEndDate";
import { DateRange } from "react-day-picker";
import Header from "../../header";
import { SelectInterval } from "@/components/SelectInterval";
import { fetchMoldHistoryByBoardPort } from "@/lib/supabase/fetchMoldHistory";
import { MoldHistoryTable } from "../../../../components/molds/moldsHistory";
import { fetchNotificationsByMachineId } from "@/lib/supabase/notification";
import NotificationTabs from "../../notifications/tabs";
import { IntervalType } from "@/types/enum";

const chartConfig = {
    average_shot_time: { label: "Avg. Shot", color: "hsl(0, 70%, 50%)" },
    total_shots: { label: "Total Shots", color: "hsl(200, 70%, 50%)" },
};

const energyConfig = {
    kwh: { label: "kWh", color: "hsl(142, 71%, 45%)" },
    heating: { label: "Heating", color: "hsl(24, 94%, 50%)" },
    production: { label: "Production", color: "hsl(200, 70%, 50%)" },
    idle: { label: "Idle", color: "hsl(220, 9%, 60%)" },
};

function formatRangeLabel(date?: DateRange) {
    const from = date?.from ? new Date(date.from) : null;
    const to = date?.to ? new Date(date.to) : null;
    if (!from || !to) return "Selected range";
    return `${from.toLocaleDateString("nl-NL")} → ${to.toLocaleDateString("nl-NL")}`;
}

function Stat({
                  label,
                  value,
                  sub,
              }: {
    label: string;
    value: React.ReactNode;
    sub?: React.ReactNode;
}) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                </CardDescription>
                <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">{sub}</CardContent>
        </Card>
    );
}

function MiniBreakdownRow({
                              label,
                              value,
                              pct,
                          }: {
    label: string;
    value: string;
    pct: number;
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700">{label}</span>
                <span className="font-medium text-slate-900">{value}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                    className="h-2 rounded-full bg-slate-900"
                    style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                />
            </div>
        </div>
    );
}

const MachinePage = () => {
    const { id } = useParams();
    const [machine, setMachine] = useState<Machine | null>(null);
    const [chartData, setChartData] = useState<MachineTimeline[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [moldsHistory, setMoldsHistory] = useState<MoldHistory[]>([]);
    const [interval, setInterval] = useState<IntervalType>(IntervalType.Hour);

    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(2020, 8, 0),
        to: new Date(2020, 8, 20),
    });

    useEffect(() => {
        if (!id) return;
        fetchNotificationsByMachineId(parseInt(id as string)).then(setNotifications);
    }, [id]);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;

            try {
                const machineData = await fetchMachine(id.toString());
                setMachine(machineData);

                const moldsfetched = await fetchMoldHistoryByBoardPort(
                    machineData.board,
                    machineData.port
                );
                setMoldsHistory(moldsfetched);

                const startDate = date?.from;
                const endDate = date?.to;
                if (!startDate || !endDate) return;

                const data = await fetchChartData(
                    machineData.board,
                    machineData.port,
                    startDate,
                    endDate,
                    interval
                );
                setChartData(data);
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };

        loadData();
    }, [id, date, interval]);

    const kpis = useMemo(() => {
        const rows: any[] = chartData as any[];

        const totalShots = rows.reduce((sum, r) => sum + (Number(r.total_shots) || 0), 0);
        const avgShot =
            rows.length > 0
                ? rows.reduce((sum, r) => sum + (Number(r.average_shot_time) || 0), 0) /
                rows.length
                : 0;

        return { totalShots, avgShot };
    }, [chartData]);

    const energy = useMemo(() => {
        const rows: any[] = chartData as any[];
        const PRICE_EUR_PER_KWH = 0.26;

        const series = rows.map((r) => {
            const shots = Number(r.total_shots) || 0;

            const production = shots * 0.00022;
            const idle = 0.55;
            const heating = shots < 10 ? 0.85 : 0.35;

            const kwh = production + idle + heating;

            return {
                truncated_timestamp: r.truncated_timestamp,
                kwh: Number(kwh.toFixed(2)),
                heating: Number(heating.toFixed(2)),
                production: Number(production.toFixed(2)),
                idle: Number(idle.toFixed(2)),
                cost: Number((kwh * PRICE_EUR_PER_KWH).toFixed(2)),
            };
        });

        const totalKwh = series.reduce((s, x) => s + x.kwh, 0);
        const totalCost = series.reduce((s, x) => s + x.cost, 0);

        const totals = {
            heating: series.reduce((s, x) => s + x.heating, 0),
            production: series.reduce((s, x) => s + x.production, 0),
            idle: series.reduce((s, x) => s + x.idle, 0),
        };

        const denom = Math.max(1e-6, totalKwh);
        const pct = {
            heating: (totals.heating / denom) * 100,
            production: (totals.production / denom) * 100,
            idle: (totals.idle / denom) * 100,
        };

        return { series, totalKwh, totalCost, totals, pct };
    }, [chartData]);

    const donutData = useMemo(() => {
        return [
            { name: "Heating", value: Number(energy.totals.heating.toFixed(2)), key: "heating" as const },
            { name: "Production", value: Number(energy.totals.production.toFixed(2)), key: "production" as const },
            { name: "Idle", value: Number(energy.totals.idle.toFixed(2)), key: "idle" as const },
        ];
    }, [energy.totals.heating, energy.totals.production, energy.totals.idle]);

    const donutTotal = useMemo(() => donutData.reduce((s, d) => s + d.value, 0), [donutData]);

    if (!machine) return <div className="p-4">Loading...</div>;

    return (
        <>
            <Header title={`Machine: ${machine.machine_name || `${machine.machine_id}`}`} />

            <div className="container mx-auto space-y-4 p-4">
                {/* KPI row */}
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Stat
                        label="Status"
                        value={
                            <span className="flex items-center gap-2 text-base">
                <StatusIndicator status={machine.status} />
                                {machine.status}
              </span>
                        }
                        sub="Current machine state"
                    />
                    <Stat label="Total shots" value={kpis.totalShots.toLocaleString()} sub="Selected range" />
                    <Stat label="Avg. shot time" value={`${kpis.avgShot.toFixed(2)}s`} sub="Bucket average" />
                    <Stat
                        label="Energy"
                        value={
                            <span className="flex items-baseline gap-2">
                {energy.totalKwh.toFixed(1)} <span className="text-sm font-medium">kWh</span>
              </span>
                        }
                        sub={
                            <span className="flex items-center justify-between">
                <span>Est. cost</span>
                <span className="font-medium text-slate-900">€{energy.totalCost.toFixed(0)}</span>
              </span>
                        }
                    />
                </div>

                {/* Energy module */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-1">
                            <CardTitle className="text-base">Energy consumption</CardTitle>
                            <CardDescription className="min-w-0">
                                Heating vs production vs idle • {formatRangeLabel(date)} (dummy model)
                            </CardDescription>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <SelectStartEndDate date={date} setDate={setDate} className="w-min" />
                            <SelectInterval setDate={setDate} interval={interval} setInterval={setInterval} />
                        </div>
                    </CardHeader>

                    <CardContent className="grid gap-4 pt-4 lg:grid-cols-3">
                        {/* Left: breakdown */}
                        <div className="min-w-0 space-y-3">
                            <div className="rounded-xl border bg-slate-50 p-3">
                                <div className="text-sm font-semibold text-slate-900">Breakdown</div>
                                <div className="mt-3 space-y-3">
                                    <MiniBreakdownRow
                                        label="Heating"
                                        value={`${energy.totals.heating.toFixed(1)} kWh`}
                                        pct={energy.pct.heating}
                                    />
                                    <MiniBreakdownRow
                                        label="Production"
                                        value={`${energy.totals.production.toFixed(1)} kWh`}
                                        pct={energy.pct.production}
                                    />
                                    <MiniBreakdownRow
                                        label="Idle"
                                        value={`${energy.totals.idle.toFixed(1)} kWh`}
                                        pct={energy.pct.idle}
                                    />
                                </div>
                                <div className="mt-3 text-[11px] text-muted-foreground">
                                    Heating share often increases during low throughput.
                                </div>
                            </div>

                            <div className="rounded-xl border p-3">
                                <div className="text-xs text-muted-foreground">Efficiency</div>
                                <div className="mt-1 text-sm font-semibold">
                                    {kpis.totalShots > 0
                                        ? `${((energy.totalKwh / kpis.totalShots) * 1000).toFixed(2)} kWh / 1k shots`
                                        : "—"}
                                </div>
                                <div className="mt-1 text-[11px] text-muted-foreground">
                                    Simple estimate for quick comparison.
                                </div>
                            </div>
                        </div>

                        {/* Right: donut + trend */}
                        <div className="min-w-0 lg:col-span-2 space-y-3">
                            <div className="rounded-xl border p-3">
                                <div className="flex items-baseline justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="text-xs text-muted-foreground">Total</div>
                                        <div className="truncate text-2xl font-semibold text-slate-900">
                                            {energy.totalKwh.toFixed(1)}{" "}
                                            <span className="text-base font-medium">kWh</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground">Estimated cost</div>
                                        <div className="text-lg font-semibold text-slate-900">
                                            €{energy.totalCost.toFixed(0)}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    {/* Donut */}
                                    <div className="rounded-xl border bg-slate-50 p-3 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-semibold text-slate-900">Energy split</div>
                                            <div className="text-xs text-muted-foreground">kWh</div>
                                        </div>

                                        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_180px]">
                                            <div className="relative min-w-0">
                                                <div className="h-[180px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            {/* ✅ Native Recharts Tooltip: no ChartContainer needed */}
                                                            <Tooltip
                                                                formatter={(value: any, name: any) => [`${Number(value).toFixed(1)} kWh`, name]}
                                                            />
                                                            <Pie
                                                                data={donutData}
                                                                dataKey="value"
                                                                nameKey="name"
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius="62%"
                                                                outerRadius="82%"
                                                                paddingAngle={3}
                                                                stroke="transparent"
                                                                isAnimationActive={false}
                                                            >
                                                                {donutData.map((entry) => (
                                                                    <Cell key={entry.name} fill={energyConfig[entry.key].color} />
                                                                ))}
                                                            </Pie>
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>

                                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="text-xs text-muted-foreground">Total</div>
                                                        <div className="text-xl font-semibold text-slate-900">
                                                            {energy.totalKwh.toFixed(1)}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">kWh</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="min-w-0 space-y-2">
                                                {donutData.map((d) => {
                                                    const pct = donutTotal > 0 ? (d.value / donutTotal) * 100 : 0;
                                                    return (
                                                        <div key={d.name} className="rounded-lg border bg-white p-2">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="flex min-w-0 items-center gap-2">
                                  <span
                                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                                      style={{ background: energyConfig[d.key].color }}
                                  />
                                                                    <span className="min-w-0 truncate text-xs font-medium text-slate-900">
                                    {d.name}
                                  </span>
                                                                </div>
                                                                <span className="shrink-0 text-xs text-slate-600">{pct.toFixed(0)}%</span>
                                                            </div>
                                                            <div className="mt-1 text-[11px] text-muted-foreground">
                                                                {d.value.toFixed(1)} kWh
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="mt-2 text-[11px] text-muted-foreground">
                                            Heating share tends to rise during low throughput.
                                        </div>
                                    </div>

                                    {/* Trend */}
                                    <Card className="shadow-sm min-w-0">
                                        <CardHeader className="border-b">
                                            <CardTitle className="text-base">Energy trend</CardTitle>
                                            <CardDescription>kWh per bucket</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <ChartContainer config={energyConfig} className="aspect-auto h-[180px] w-full">
                                                <ComposedChart accessibilityLayer data={energy.series}>
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis dataKey="truncated_timestamp" hide />
                                                    <YAxis hide domain={["auto", "auto"]} />
                                                    <ChartTooltip content={<ChartTooltipContent />} />
                                                    <Area
                                                        dataKey="kwh"
                                                        type="monotone"
                                                        stroke={energyConfig.kwh.color}
                                                        fill={energyConfig.kwh.color}
                                                        fillOpacity={0.12}
                                                    />
                                                    <Line dot={false} dataKey="kwh" stroke={energyConfig.kwh.color} strokeWidth={2} />
                                                </ComposedChart>
                                            </ChartContainer>

                                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                                                <span>Est. cost: €{energy.totalCost.toFixed(0)}</span>
                                                <span className="truncate">{formatRangeLabel(date)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Production chart */}
                <Card className="shadow-sm">
                    <CardHeader className="border-b">
                        <CardTitle className="text-base">Production overview</CardTitle>
                        <CardDescription>Shots + average shot time</CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
                            <ComposedChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="truncated_timestamp"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value && new Date(value).toLocaleDateString("nl-NL")}
                                />
                                <YAxis tickLine={false} tickMargin={10} axisLine={false} domain={[0, 10]} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="total_shots" fill={chartConfig.total_shots.color} radius={4} />
                                <Line
                                    dot={false}
                                    dataKey="average_shot_time"
                                    stroke={chartConfig.average_shot_time.color}
                                    strokeWidth={2}
                                />
                                <Legend content={<ChartLegendContent className="flex flex-wrap" />} />
                            </ComposedChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Lower grid */}
                <div className="grid gap-3 lg:grid-cols-2">
                    <Card className="shadow-sm">
                        <CardHeader className="border-b">
                            <CardTitle className="text-base">Notifications</CardTitle>
                            <CardDescription>Recent alerts & events</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <NotificationTabs notifications={notifications} />
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="border-b">
                            <CardTitle className="text-base">Molds History</CardTitle>
                            <CardDescription>Changes across the selected period</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <MoldHistoryTable
                                moldsHistory={moldsHistory}
                                setRange={setDate}
                                showMachine={false}
                                showMold={true}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default MachinePage;
