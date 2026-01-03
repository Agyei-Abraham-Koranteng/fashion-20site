import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { getSiteVisits, deleteSiteVisit } from "@/lib/api";
import { format, startOfDay, subDays, isWithinInterval } from "date-fns";
import {
    Users,
    Activity,
    Globe,
    Monitor,
    Clock,
    Calendar,
    ArrowUpRight,
    Search,
    Trash2,
    BarChart3,
    History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from "recharts";
import { cn } from "@/lib/utils";

export default function VisitorAnalytics() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    const { data: visits = [], isLoading } = useQuery({
        queryKey: ["site_visits"],
        queryFn: async () => {
            const { data, error } = await getSiteVisits();
            if (error) throw error;
            return (data as any[]) || [];
        },
    });

    // Real-time listener
    useEffect(() => {
        const channel = supabase
            .channel("site_visits_realtime")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "site_visits" },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["site_visits"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    const stats = useMemo(() => {
        if (visits.length === 0) return { total: 0, today: 0, last7Days: 0, growth: 0 };

        const now = new Date();
        const startOfToday = startOfDay(now);
        const sevenDaysAgo = subDays(now, 7);
        const fourteenDaysAgo = subDays(now, 14);

        const todayVisits = visits.filter(v => new Date(v.visited_at) >= startOfToday).length;
        const last7DaysVisits = visits.filter(v => new Date(v.visited_at) >= sevenDaysAgo).length;
        const prev7DaysVisits = visits.filter(v => {
            const date = new Date(v.visited_at);
            return date >= fourteenDaysAgo && date < sevenDaysAgo;
        }).length;

        const growth = prev7DaysVisits === 0 ? 100 : Math.round(((last7DaysVisits - prev7DaysVisits) / prev7DaysVisits) * 100);

        return {
            total: visits.length,
            today: todayVisits,
            last7Days: last7DaysVisits,
            growth
        };
    }, [visits]);

    const chartData = useMemo(() => {
        const days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(new Date(), 6 - i);
            return {
                date: format(date, "MMM d"),
                fullDate: startOfDay(date),
                count: 0
            };
        });

        visits.forEach(v => {
            const visitDate = startOfDay(new Date(v.visited_at));
            const dayEntry = days.find(d => d.fullDate.getTime() === visitDate.getTime());
            if (dayEntry) dayEntry.count++;
        });

        return days;
    }, [visits]);

    const filteredVisits = useMemo(() => {
        return visits.filter(v =>
            v.page_path?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.user_agent?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 50);
    }, [visits, searchTerm]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this visit record?")) return;
        try {
            const { error } = await deleteSiteVisit(id);
            if (error) throw error;
            toast.success("Record deleted");
            queryClient.invalidateQueries({ queryKey: ["site_visits"] });
        } catch (err) {
            toast.error("Failed to delete record");
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-1 sm:px-0">
            <header className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2 sm:gap-3">
                            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400" />
                            Visitors
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time traffic and flow.</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800/30 shadow-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Live</span>
                    </div>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { label: "Total", value: stats.total, icon: Users, color: "indigo" },
                    { label: "Today", value: stats.today, icon: Clock, color: "emerald" },
                    { label: "7 Days", value: stats.last7Days, icon: Calendar, color: "blue" },
                    { label: "Growth", value: `${stats.growth > 0 ? "+" : ""}${stats.growth}%`, icon: ArrowUpRight, color: "orange" },
                ].map((item, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white dark:bg-slate-900 border border-gray-100/50 dark:border-slate-800">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex justify-between items-start mb-2 sm:mb-4">
                                <div className={cn("p-1.5 sm:p-2 rounded-lg sm:rounded-xl", `bg-${item.color}-500/10`)}>
                                    <item.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", `text-${item.color}-600`)} />
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest truncate">{item.label}</p>
                                <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-gray-100">{item.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Traffic Chart */}
                <Card className="lg:col-span-2 border-none shadow-md bg-white dark:bg-slate-900/50 overflow-hidden">
                    <CardHeader className="border-b bg-gray-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Traffic Overview</CardTitle>
                                <CardDescription>Daily visits for the past 7 days</CardDescription>
                            </div>
                            <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800" opacity={0.5} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
                                        tickMargin={10}
                                        stroke="currentColor"
                                        className="text-muted-foreground"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
                                        stroke="currentColor"
                                        className="text-muted-foreground"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            backgroundColor: 'var(--background)',
                                            color: 'var(--foreground)'
                                        }}
                                        itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#4f46e5"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorVisits)"
                                        dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: 'var(--background)' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Visits Activity */}
                <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="border-b dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Live Activity</CardTitle>
                                <CardDescription>Recent page interactions</CardDescription>
                            </div>
                            <History className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[380px]">
                            <div className="divide-y divide-gray-100">
                                {filteredVisits.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No recent activity
                                    </div>
                                ) : (
                                    filteredVisits.map((visit, i) => (
                                        <div key={visit.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none px-1.5 py-0 text-[10px]">
                                                            {visit.page_path}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {format(new Date(visit.visited_at), "h:mm a")}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                                                        {visit.user_agent}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(visit.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Log Card */}
            <Card className="border-none shadow-md bg-white dark:bg-slate-900">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle>Detailed Visit Logs</CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by path or device..."
                                className="pl-9 h-9 border-gray-100 focus-visible:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Desktop Table - Hidden on small tablets and below */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 dark:bg-slate-900/50 text-muted-foreground font-medium border-y border-border">
                                <tr>
                                    <th className="px-6 py-3">Timestamp</th>
                                    <th className="px-6 py-3">Path</th>
                                    <th className="px-6 py-3">Device / User Agent</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isLoading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="px-6 py-4 bg-muted/20"></td>
                                        </tr>
                                    ))
                                ) : filteredVisits.map((visit) => (
                                    <tr key={visit.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                            {format(new Date(visit.visited_at), "MMM d, yyyy HH:mm:ss")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-foreground bg-muted px-2 py-0.5 rounded text-xs uppercase tracking-tight">
                                                {visit.page_path}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground italic text-xs max-w-xs truncate">
                                            {visit.user_agent}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(visit.id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile/Tablet List View - Visible on screens smaller than lg */}
                    <div className="lg:hidden divide-y divide-border">
                        {isLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="p-4 animate-pulse">
                                    <div className="h-4 w-1/2 bg-muted/20 rounded mb-2" />
                                    <div className="h-3 w-1/4 bg-muted/10 rounded" />
                                </div>
                            ))
                        ) : filteredVisits.map((visit) => (
                            <div key={visit.id} className="p-4 space-y-2 hover:bg-muted/10">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1 overflow-hidden">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-foreground text-[10px] uppercase tracking-tighter bg-muted px-1.5 py-0.5 rounded">
                                                {visit.page_path}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {format(new Date(visit.visited_at), "MMM d, HH:mm")}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic truncate">
                                            {visit.user_agent}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive flex-shrink-0"
                                        onClick={() => handleDelete(visit.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
