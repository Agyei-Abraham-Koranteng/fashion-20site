import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Subscriber {
    id: string;
    email: string;
    subscribed_at: string;
}

export default function NewsletterAdmin() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const { data, error } = await supabase
                .from("newsletter_subscribers")
                .select("*")
                .order("subscribed_at", { ascending: false });

            if (error) throw error;
            setSubscribers(data || []);
        } catch (error) {
            console.error("Error fetching subscribers:", error);
            toast.error("Failed to load subscribers.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, email: string) => {
        if (!window.confirm(`Are you sure you want to remove ${email}?`)) return;

        try {
            const { error } = await supabase
                .from("newsletter_subscribers")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast.success("Subscriber removed successfully.");
            setSubscribers(subscribers.filter((s) => s.id !== id));
        } catch (error) {
            console.error("Error deleting subscriber:", error);
            toast.error("Failed to remove subscriber.");
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Newsletter Subscribers</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your newsletter subscriptions. Total: {subscribers.length}
                    </p>
                </div>
                <Button onClick={() => {
                    const csv = subscribers.map(s => `${s.email},${s.subscribed_at}`).join("\n");
                    const blob = new Blob([`Email,Date\n${csv}`], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
                    a.click();
                }} variant="outline">
                    Export CSV
                </Button>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Subscribed At</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscribers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-32 text-muted-foreground">
                                    No subscribers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            subscribers.map((subscriber) => (
                                <TableRow key={subscriber.id}>
                                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                                    <TableCell>
                                        {format(new Date(subscriber.subscribed_at), "PPP p")}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(subscriber.id, subscriber.email)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
