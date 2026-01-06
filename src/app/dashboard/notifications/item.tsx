"use client";

import { MachineTimeline, Notification } from "@/types/supabase";
import { getNotificationColor, getNotificationHex } from "./util";
import { fetchChartData } from "@/lib/supabase/fetchMachineTimelines";
import { useEffect, useMemo, useState } from "react";
import { addDays } from "date-fns";
import { IntervalType } from "@/types/interval";


import TimelineChart from "@/components/timeline/TimelineChart";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface NotificationItemProps {
    notification: Notification;
    onClick?: () => void;
}

function formatDetectedAt(value: string | Date) {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("nl-NL");
}

export default function NotificationItem({ notification, onClick }: NotificationItemProps) {
    const [chartData, setChartData] = useState<MachineTimeline[]>([]);

    const startDate = useMemo(() => new Date(notification.detected_at), [notification.detected_at]);
    const endDate = useMemo(() => addDays(startDate, 1), [startDate]);

    useEffect(() => {
        const loadData = async () => {
            if (!notification.board || !notification.port) return;
            try {
                const data = await fetchChartData(
                    notification.board,
                    notification.port,
                    startDate,
                    endDate,
                    IntervalType.Hour
                );
                setChartData(data);
            } catch {
                // swallow: chart is decorative
            }
        };

        loadData();
    }, [notification.board, notification.port, startDate, endDate]);

    const lineColor = getNotificationHex(notification);

    // A clean “status rail” (uses your util color class)
    const railClass = getNotificationColor(notification);

    const faded = notification.read_at ? "opacity-70" : "opacity-100";

    return (
        <div
            className={[
                "group relative overflow-hidden rounded-xl border bg-white p-3",
                "transition hover:shadow-sm",
                "cursor-pointer",
                faded,
            ].join(" ")}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onClick?.();
            }}
        >
            {/* left rail */}
            <div className={`absolute left-0 top-0 h-full w-1.5 ${railClass}`} />

            <div className="flex items-start gap-3 pl-2">
                {/* Main text */}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="shrink-0">
                            {notification.board} - {notification.port}
                        </Badge>

                        {notification.resolved_at ? (
                            <Badge variant="outline" className="shrink-0">
                                Resolved
                            </Badge>
                        ) : null}

                        {!notification.read_at && !notification.resolved_at ? (
                            <Badge className="shrink-0">New</Badge>
                        ) : null}
                    </div>

                    <div className="mt-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900">
                                {notification.message}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                <span>{formatDetectedAt(notification.detected_at)}</span>

                                {notification.machine_id ? (
                                    <Link
                                        href={`/dashboard/machines/${notification.machine_id}`}
                                        className="underline underline-offset-2 hover:text-slate-900"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Machine {notification.machine_id}
                                    </Link>
                                ) : null}

                                {notification.mold_id ? (
                                    <Link
                                        href={`/dashboard/molds/${notification.mold_id}`}
                                        className="underline underline-offset-2 hover:text-slate-900"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Matrijs {notification.mold_id}
                                    </Link>
                                ) : null}
                            </div>
                        </div>

                        {/* Sparkline (small + subtle, not overlay) */}
                        <div className="hidden w-[180px] shrink-0 sm:block">
                            <div className="h-[46px] w-full rounded-md border bg-slate-50 p-1">
                                <TimelineChart
                                    data={chartData}
                                    interval={IntervalType.Hour}
                                    hideAxis
                                    hideTooltip
                                    lineColor={lineColor}
                                />
                            </div>
                            <div className="mt-1 text-right text-[10px] text-muted-foreground">
                                last 24h snapshot
                            </div>
                        </div>
                    </div>
                </div>

                {/* affordance */}
                <div className="mt-1 text-xs text-muted-foreground opacity-0 transition group-hover:opacity-100">
                    Mark read
                </div>
            </div>
        </div>
    );
}
