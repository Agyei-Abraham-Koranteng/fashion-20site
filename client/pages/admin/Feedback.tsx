import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSystemFeedback } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import { SystemFeedback } from "@/lib/types";
import { format } from "date-fns";
import {
    Star,
    Search,
    Filter,
    MessageSquare,
    Calendar,
    TrendingUp,
    AlertCircle,
    ArrowUpDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function Feedback() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRating, setFilterRating] = useState<number | "all">("all");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

    const { data: result, isLoading } = useQuery({
        queryKey: ["system_feedback"],
        queryFn: async () => {
            const { data, error } = await getSystemFeedback();
            if (error) throw error;
            return data as SystemFeedback[] || [];
        },
    });

    // Real-time listener
    useEffect(() => {
        const channel = supabase
            .channel("system_feedback_changes")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "system_feedback",
                },
                (payload) => {
                    console.log("[Real-time] New feedback received:", payload);
                    // Invalidate and refetch to keep data in sync
                    queryClient.invalidateQueries({ queryKey: ["system_feedback"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    const feedbackList = result || [];

    const stats = useMemo(() => {
        if (feedbackList.length === 0) return { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] };

        const total = feedbackList.length;
        const sum = feedbackList.reduce((acc, curr) => acc + curr.rating, 0);
        const distribution = [0, 0, 0, 0, 0];
        feedbackList.forEach(f => {
            if (f.rating >= 1 && f.rating <= 5) distribution[f.rating - 1]++;
        });

        return {
            average: (sum / total).toFixed(1),
            total,
            distribution: distribution.reverse() // 5 stars to 1 star
        };
    }, [feedbackList]);

    const filteredFeedback = useMemo(() => {
        return feedbackList
            .filter((f) => {
                const matchesSearch = f.feedback.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesRating = filterRating === "all" || f.rating === filterRating;
                return matchesSearch && matchesRating;
            })
            .sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
            });
    }, [feedbackList, searchTerm, filterRating, sortOrder]);

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={cn(
                            "w-3.5 h-3.5",
                            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                        )}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">System Feedback</h1>
                <p className="text-muted-foreground mt-1">Monitor and analyze customer experience ratings.</p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-indigo-500" />
                            Average Rating
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-gray-900">{stats.average}</span>
                            <span className="text-lg text-gray-400">/ 5.0</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-yellow-500">
                            {renderStars(Math.round(Number(stats.average)))}
                            <span className="text-xs text-muted-foreground ml-1">({stats.total} reviews)</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Rating Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {stats.distribution.map((count, i) => {
                                const starLevel = 5 - i;
                                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                return (
                                    <div key={starLevel} className="flex items-center gap-3">
                                        <span className="text-xs font-medium w-3 text-gray-600">{starLevel}</span>
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        <Progress value={percentage} className="h-1.5 flex-1 bg-gray-100" />
                                        <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="bg-white border-gray-100 shadow-md overflow-hidden">
                <CardHeader className="border-b bg-gray-50/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-indigo-600" />
                            Customer Comments
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search comments..."
                                    className="pl-9 h-9 border-gray-200 ring-offset-0 focus-visible:ring-1 focus-visible:ring-indigo-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                                <button
                                    onClick={() => setFilterRating("all")}
                                    className={cn(
                                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                        filterRating === "all" ? "bg-white shadow-sm text-indigo-600" : "text-muted-foreground hover:text-gray-900"
                                    )}
                                >
                                    All
                                </button>
                                {[5, 4, 3, 2, 1].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setFilterRating(r)}
                                        className={cn(
                                            "px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-all",
                                            filterRating === r ? "bg-white shadow-sm text-indigo-600" : "text-muted-foreground hover:text-gray-900"
                                        )}
                                    >
                                        {r} <Star className={cn("w-3 h-3", filterRating === r ? "fill-yellow-400 text-yellow-400" : "fill-none")} />
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
                                className="h-9 px-3 flex items-center gap-2 border border-gray-200 rounded-lg text-xs font-medium bg-white hover:bg-gray-50 transition-colors"
                            >
                                <ArrowUpDown className="w-3.5 h-3.5" />
                                {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                        <div className="divide-y divide-gray-100">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="p-6 space-y-3 animate-pulse">
                                        <div className="flex justify-between">
                                            <div className="h-4 w-24 bg-gray-100 rounded" />
                                            <div className="h-4 w-20 bg-gray-100 rounded" />
                                        </div>
                                        <div className="h-16 w-full bg-gray-50 rounded" />
                                    </div>
                                ))
                            ) : filteredFeedback.length === 0 ? (
                                <div className="p-20 text-center text-muted-foreground">
                                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                    <p className="text-lg font-medium text-gray-400">No feedback entries found</p>
                                    <p className="text-sm">Try adjusting your filters or search term</p>
                                </div>
                            ) : (
                                filteredFeedback.map((f) => (
                                    <div key={f.id} className="p-6 hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm",
                                                    f.rating >= 4 ? "bg-green-50 text-green-700 border border-green-100" :
                                                        f.rating === 3 ? "bg-yellow-50 text-yellow-700 border border-yellow-100" :
                                                            "bg-red-50 text-red-700 border border-red-100"
                                                )}>
                                                    {f.rating}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        {renderStars(f.rating)}
                                                        <Badge variant="outline" className={cn(
                                                            "text-[10px] px-1.5 py-0 uppercase tracking-tight",
                                                            f.rating >= 4 ? "text-green-600 border-green-100 bg-green-50/50" :
                                                                f.rating === 3 ? "text-yellow-600 border-yellow-100 bg-yellow-50/50" :
                                                                    "text-red-600 border-red-100 bg-red-50/50"
                                                        )}>
                                                            {f.rating >= 4 ? "Positive" : f.rating === 3 ? "Neutral" : "Negative"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(f.created_at), "PPP 'at' p")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                                            <p className="text-gray-800 text-sm leading-relaxed italic">
                                                "{f.feedback || "No comment provided"}"
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                {filteredFeedback.length > 0 && (
                    <div className="p-4 border-t bg-gray-50/30 text-center text-xs text-muted-foreground font-medium">
                        Showing {filteredFeedback.length} of {feedbackList.length} total entries
                    </div>
                )}
            </Card>
        </div>
    );
}
