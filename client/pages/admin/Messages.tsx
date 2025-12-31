import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContactMessages, updateContactMessageStatus } from "@/lib/api";
import { format } from "date-fns";
import {
    Mail,
    MailOpen,
    Reply,
    CheckCircle2,
    Clock,
    User,
    MessageSquare,
    Search,
    ArrowLeft,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Messages() {
    const queryClient = useQueryClient();
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const { data: messages = [], isLoading } = useQuery({
        queryKey: ["contact_messages"],
        queryFn: async () => {
            const { data, error } = await getContactMessages();
            if (error) throw error;
            return data || [];
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            updateContactMessageStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contact_messages"] });
            toast.success("Message status updated");
        },
    });

    const filteredMessages = messages.filter((msg: any) => {
        const matchesSearch =
            msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || msg.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleSelectMessage = (msg: any) => {
        setSelectedMessage(msg);
        if (msg.status === "unread") {
            updateStatusMutation.mutate({ id: msg.id, status: "read" });
        }
    };

    const handleBack = () => {
        setSelectedMessage(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "unread":
                return <Badge variant="destructive" className="bg-red-500">Unread</Badge>;
            case "read":
                return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white border-0">Read</Badge>;
            case "replied":
                return <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">Replied</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-auto">
            {/* Header - Always visible */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Messages</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Manage client inquiries</p>
                </div>
            </div>

            {/* Mobile: Show either list OR detail */}
            <div className="flex-1 min-h-0">
                {/* Desktop Grid / Mobile Single View */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-full">

                    {/* Message List - Hidden on mobile when viewing a message */}
                    <Card className={cn(
                        "lg:col-span-1 flex flex-col bg-white/50 backdrop-blur-sm border-gray-200 shadow-sm overflow-hidden",
                        selectedMessage ? "hidden lg:flex" : "flex",
                        "h-[calc(100vh-220px)] md:h-[500px] lg:h-[calc(100vh-200px)]"
                    )}>
                        <CardContent className="p-3 md:p-4 flex flex-col h-full">
                            <div className="space-y-3 mb-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search messages..."
                                        className="pl-9 bg-gray-50 border-gray-200 h-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto">
                                    {["all", "unread", "read", "replied"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setFilterStatus(status)}
                                            className={cn(
                                                "flex-1 min-w-[60px] px-2 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap",
                                                filterStatus === status
                                                    ? "bg-white shadow-sm text-primary"
                                                    : "text-muted-foreground hover:text-primary"
                                            )}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <ScrollArea className="flex-1 -mx-3 md:-mx-4">
                                <div className="px-3 md:px-4 space-y-2">
                                    {isLoading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
                                        ))
                                    ) : filteredMessages.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <Mail className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                            <p>No messages found</p>
                                        </div>
                                    ) : (
                                        filteredMessages.map((msg: any) => (
                                            <div
                                                key={msg.id}
                                                onClick={() => handleSelectMessage(msg)}
                                                className={cn(
                                                    "p-3 md:p-4 rounded-xl cursor-pointer transition-all border relative",
                                                    selectedMessage?.id === msg.id
                                                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                                                        : "bg-white hover:bg-gray-50 border-gray-100 shadow-sm",
                                                    msg.status === "unread" && selectedMessage?.id !== msg.id && "border-l-4 border-l-red-500"
                                                )}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={cn("font-semibold text-sm truncate max-w-[140px] md:max-w-[120px]",
                                                        selectedMessage?.id === msg.id ? "text-white" : "text-gray-900")}>
                                                        {msg.name}
                                                    </span>
                                                    <span className={cn("text-[10px] flex-shrink-0 ml-2",
                                                        selectedMessage?.id === msg.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                                        {format(new Date(msg.created_at), "MMM d")}
                                                    </span>
                                                </div>
                                                <p className={cn("text-xs truncate mb-2",
                                                    selectedMessage?.id === msg.id ? "text-primary-foreground/90" : "text-gray-600")}>
                                                    {msg.subject}
                                                </p>
                                                {selectedMessage?.id !== msg.id && getStatusBadge(msg.status)}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Message Detail - Full screen on mobile when selected */}
                    <Card className={cn(
                        "lg:col-span-2 bg-white border-gray-200 shadow-sm overflow-hidden",
                        selectedMessage ? "flex" : "hidden lg:flex",
                        "h-[calc(100vh-220px)] md:h-[500px] lg:h-[calc(100vh-200px)]"
                    )}>
                        <CardContent className="p-0 h-full flex flex-col w-full">
                            {selectedMessage ? (
                                <div className="flex flex-col h-full">
                                    {/* Message Header */}
                                    <div className="p-4 md:p-6 border-b bg-gray-50/50">
                                        {/* Mobile Back Button */}
                                        <div className="flex items-center gap-2 mb-3 lg:hidden">
                                            <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 px-2">
                                                <ArrowLeft className="h-4 w-4 mr-1" /> Back
                                            </Button>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                            <div className="flex gap-3">
                                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <User className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 truncate">{selectedMessage.name}</h2>
                                                    <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1 truncate">
                                                        <Mail className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate">{selectedMessage.email}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1 text-xs md:text-sm"
                                                    onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`)}
                                                >
                                                    <Reply className="h-3 w-3 md:h-4 md:w-4" /> Reply
                                                </Button>
                                                {selectedMessage.status !== "replied" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 gap-1 text-xs md:text-sm"
                                                        onClick={() => updateStatusMutation.mutate({ id: selectedMessage.id, status: "replied" })}
                                                    >
                                                        <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4" />
                                                        <span className="hidden sm:inline">Mark</span> Replied
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Meta */}
                                    <div className="px-4 md:px-6 py-3 bg-white border-b">
                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-xs md:text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                                                <span className="font-medium text-gray-700">Subject:</span>
                                                <span className="truncate">{selectedMessage.subject}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <Clock className="h-4 w-4" />
                                                <span className="hidden sm:inline">
                                                    {format(new Date(selectedMessage.created_at), "MMM d, yyyy 'at' p")}
                                                </span>
                                                <span className="sm:hidden">
                                                    {format(new Date(selectedMessage.created_at), "MMM d, p")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Body */}
                                    <ScrollArea className="flex-1">
                                        <div className="p-4 md:p-8">
                                            <div className="max-w-2xl mx-auto">
                                                <div className="bg-gray-50 p-4 md:p-8 rounded-xl md:rounded-2xl border border-gray-100 min-h-[150px] whitespace-pre-wrap leading-relaxed text-gray-800 text-sm md:text-base">
                                                    {selectedMessage.message}
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-8">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                        <MailOpen className="h-8 w-8 md:h-10 md:w-10 opacity-20" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Select a message</h3>
                                    <p className="max-w-xs mt-1 text-sm">Choose a message from the list to view details.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
