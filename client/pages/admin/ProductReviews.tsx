import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllProductReviews, deleteProductReview } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import { Review } from "@/lib/types";
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
    Trash2,
    Package,
    User,
    ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function ProductReviews() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRating, setFilterRating] = useState<number | "all">("all");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

    const { data: reviews = [], isLoading } = useQuery({
        queryKey: ["all_product_reviews"],
        queryFn: async () => {
            const { data, error } = await getAllProductReviews();
            if (error) throw error;
            return (data as any[]) || [];
        },
    });

    // Real-time listener
    useEffect(() => {
        const channel = supabase
            .channel("product_reviews_admin_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "product_reviews",
                },
                (payload) => {
                    console.log("[Real-time] Product review change received:", payload);
                    queryClient.invalidateQueries({ queryKey: ["all_product_reviews"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    const stats = useMemo(() => {
        if (reviews.length === 0) return { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] };

        const total = reviews.length;
        const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        const distribution = [0, 0, 0, 0, 0];
        reviews.forEach(f => {
            if (f.rating >= 1 && f.rating <= 5) distribution[f.rating - 1]++;
        });

        return {
            average: (sum / total).toFixed(1),
            total,
            distribution: [...distribution].reverse() // 5 stars to 1 star
        };
    }, [reviews]);

    const filteredReviews = useMemo(() => {
        return reviews
            .filter((f) => {
                const searchStr = searchTerm.toLowerCase();
                const matchesSearch =
                    f.comment?.toLowerCase().includes(searchStr) ||
                    f.title?.toLowerCase().includes(searchStr) ||
                    f.user_name?.toLowerCase().includes(searchStr) ||
                    f.product?.name?.toLowerCase().includes(searchStr);
                const matchesRating = filterRating === "all" || f.rating === filterRating;
                return matchesSearch && matchesRating;
            })
            .sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
            });
    }, [reviews, searchTerm, filterRating, sortOrder]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            const { error } = await deleteProductReview(id);
            if (error) throw error;
            toast.success("Review deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["all_product_reviews"] });
        } catch (error) {
            console.error("Error deleting review:", error);
            toast.error("Failed to delete review");
        }
    };

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
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Product Reviews</h1>
                    <p className="text-muted-foreground mt-1">Manage and moderate customer product reviews.</p>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-indigo-500" />
                            Overall Rating
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-gray-900">{stats.average}</span>
                            <span className="text-lg text-gray-400">/ 5.0</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-yellow-500">
                            {renderStars(Math.round(Number(stats.average)))}
                            <span className="text-xs text-muted-foreground ml-1">({stats.total} total reviews)</span>
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
                            Recent Reviews
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search reviews or products..."
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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
                                className="h-9 gap-2 text-xs"
                            >
                                <ArrowUpDown className="w-3.5 h-3.5" />
                                {sortOrder === "newest" ? "Newest" : "Oldest"}
                            </Button>
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
                            ) : filteredReviews.length === 0 ? (
                                <div className="p-20 text-center text-muted-foreground">
                                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                    <p className="text-lg font-medium text-gray-400">No reviews found</p>
                                    <p className="text-sm">Try adjusting your filters or search term</p>
                                </div>
                            ) : (
                                filteredReviews.map((f) => (
                                    <div key={f.id} className="p-6 hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                            <div className="flex items-start gap-4">
                                                <div className={cn(
                                                    "h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
                                                    f.rating >= 4 ? "bg-green-50 text-green-700 border border-green-100" :
                                                        f.rating === 3 ? "bg-yellow-50 text-yellow-700 border border-yellow-100" :
                                                            "bg-red-50 text-red-700 border border-red-100"
                                                )}>
                                                    {f.rating}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-bold text-gray-900">{f.user_name || "Anonymous"}</span>
                                                        <Badge variant="outline" className={cn(
                                                            "text-[10px] px-1.5 py-0 uppercase tracking-tight",
                                                            f.rating >= 4 ? "text-green-600 border-green-100 bg-green-50/50" :
                                                                f.rating === 3 ? "text-yellow-600 border-yellow-100 bg-yellow-50/50" :
                                                                    "text-red-600 border-red-100 bg-red-50/50"
                                                        )}>
                                                            {f.rating >= 4 ? "Positive" : f.rating === 3 ? "Neutral" : "Negative"}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2">
                                                            <Calendar className="w-3 h-3" />
                                                            {format(new Date(f.created_at), "MMM d, yyyy")}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
                                                        <Package className="w-4 h-4" />
                                                        <span>{f.product?.name || "Unknown Product"}</span>
                                                        <Link to={`/product/${f.product_id}`} target="_blank" className="text-gray-400 hover:text-indigo-600 transition-colors">
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </Link>
                                                    </div>
                                                    {renderStars(f.rating)}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDelete(f.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm group-hover:shadow-md transition-all ml-16">
                                            {f.title && <h4 className="font-bold text-gray-900 mb-1">{f.title}</h4>}
                                            <p className="text-gray-700 text-sm leading-relaxed italic">
                                                "{f.comment || "No comment provided"}"
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                {filteredReviews.length > 0 && (
                    <div className="p-4 border-t bg-gray-50/30 text-center text-xs text-muted-foreground font-medium">
                        Showing {filteredReviews.length} of {reviews.length} total reviews
                    </div>
                )}
            </Card>
        </div>
    );
}
