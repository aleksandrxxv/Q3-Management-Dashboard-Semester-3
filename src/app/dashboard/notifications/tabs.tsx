"use client";

import { useEffect, useMemo, useState } from "react";
import { Notification } from "@/types/supabase";
import NotificationItem from "./item";
import { markAsRead } from "@/lib/supabase/notification";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabKey = "unread" | "unresolved" | "resolved" | "all";

interface NotificationTabsProps {
    notifications: Notification[];
}

export default function NotificationTabs({ notifications: incoming }: NotificationTabsProps) {
    const [tab, setTab] = useState<TabKey>("unread");
    const [query, setQuery] = useState<string>("");
    const [local, setLocal] = useState<Notification[]>([]);

    useEffect(() => {
        setLocal(incoming);
    }, [incoming]);

    const counts = useMemo(() => {
        const all = local.length;
        const unread = local.filter((n) => !n.read_at && !n.resolved_at).length;
        const unresolved = local.filter((n) => !n.resolved_at).length;
        const resolved = local.filter((n) => !!n.resolved_at).length;
        return { all, unread, unresolved, resolved };
    }, [local]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        const base =
            tab === "unread"
                ? local.filter((n) => !n.read_at && !n.resolved_at)
                : tab === "unresolved"
                    ? local.filter((n) => !n.resolved_at)
                    : tab === "resolved"
                        ? local.filter((n) => !!n.resolved_at)
                        : local;

        if (!q) return base;

        return base.filter((n) => {
            const msg = (n.message ?? "").toLowerCase();
            const boardPort = `${n.board ?? ""} ${n.port ?? ""}`.toLowerCase();
            const machine = n.machine_id ? `machine ${n.machine_id}` : "";
            const mold = n.mold_id ? `mold ${n.mold_id}` : "";
            return (
                msg.includes(q) ||
                boardPort.includes(q) ||
                machine.toLowerCase().includes(q) ||
                mold.toLowerCase().includes(q)
            );
        });
    }, [local, tab, query]);

    const markAsReadN = async (id: number) => {
        // optimistic remove from list
        setLocal((prev) => prev.filter((n) => n.id !== id));
        try {
            await markAsRead(id);
        } catch {
            // revert on failure (best effort)
            setLocal((prev) => {
                const fromIncoming = incoming.find((n) => n.id === id);
                return fromIncoming ? [fromIncoming, ...prev] : prev;
            });
        }
    };

    return (
        <div className="space-y-3">
            {/* Header controls */}
            <div className="space-y-2">
                <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
                    <TabsList className="w-full flex flex-wrap justify-start gap-1 h-auto p-1">
                        <TabsTrigger value="unread" className="gap-2">
                            Unread
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          {counts.unread}
        </span>
                        </TabsTrigger>
                        <TabsTrigger value="unresolved" className="gap-2">
                            Unresolved
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          {counts.unresolved}
        </span>
                        </TabsTrigger>
                        <TabsTrigger value="resolved" className="gap-2">
                            Resolved
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          {counts.resolved}
        </span>
                        </TabsTrigger>
                        <TabsTrigger value="all" className="gap-2">
                            All
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          {counts.all}
        </span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex w-full gap-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search notifications…"
                        className="w-full"
                    />
                    {query ? (
                        <Button variant="outline" onClick={() => setQuery("")}>
                            Clear
                        </Button>
                    ) : null}
                </div>
            </div>


            {/* Content */}
            {incoming.length === 0 ? (
                <div className="rounded-xl border bg-slate-50 p-6 text-sm text-muted-foreground">
                    No notifications found.
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-xl border bg-slate-50 p-6 text-sm text-muted-foreground">
                    No notifications match this filter.
                </div>
            ) : (
                <div className="max-h-[520px] overflow-auto pr-1">
                    <div className="grid grid-cols-1 gap-3">
                    {filtered.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onClick={() => markAsReadN(notification.id)}
                        />
                    ))}
                    </div>
                </div>
            )}
        </div>
    );
}
