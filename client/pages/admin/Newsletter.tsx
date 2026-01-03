import { useState, useEffect } from "react";
import { getNewsletterSubscribers, deleteNewsletterSubscriber } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface Subscriber {
    id: string;
    email: string;
    subscribed_at: string;
}

export default function NewsletterAdmin() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [subscriberToDelete, setSubscriberToDelete] = useState<{ id: string; email: string } | null>(null);

    useEffect(() => {
        fetchSubscribers();
    }, []);



    // ... inside component

    const fetchSubscribers = async () => {
        try {
            const { data, error } = await getNewsletterSubscribers();

            if (error) throw error;
            setSubscribers(data || []);
        } catch (error) {
            console.error("Error fetching subscribers:", error);
            toast.error("Failed to load subscribers.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await deleteNewsletterSubscriber(id);

            if (error) throw error;

            toast.success("Subscriber removed successfully.");
            setSubscribers(subscribers.filter((s) => s.id !== id));
        } catch (error) {
            console.error("Error deleting subscriber:", error);
            toast.error("Failed to remove subscriber.");
        } finally {
            setSubscriberToDelete(null);
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
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Newsletter Subscribers</h1>
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

            <div className="rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-200 dark:border-slate-800">
                            <TableHead className="text-gray-900 dark:text-gray-300">Email</TableHead>
                            <TableHead className="text-gray-900 dark:text-gray-300">Subscribed At</TableHead>
                            <TableHead className="w-[100px] text-gray-900 dark:text-gray-300">Actions</TableHead>
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
                                <TableRow key={subscriber.id} className="border-gray-200 dark:border-slate-800">
                                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">{subscriber.email}</TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400">
                                        {format(new Date(subscriber.subscribed_at), "PPP p")}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSubscriberToDelete({ id: subscriber.id, email: subscriber.email })}
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

            <AlertDialog open={!!subscriberToDelete} onOpenChange={(open) => !open && setSubscriberToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Subscriber?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove <strong>{subscriberToDelete?.email}</strong> from the newsletter list?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => subscriberToDelete && handleDelete(subscriberToDelete.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
