import { useState, useEffect, useRef } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { getAllOrders, updateOrderStatus } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const statusColors = {
  pending: "secondary",
  processing: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
} as const;

export default function OrdersListAdmin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Refs for debouncing and concurrency control
  const isFetchingRef = useRef(false);
  const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadOrders = async (silent = false) => {
    if (isFetchingRef.current) return;

    if (!silent) setLoading(true);
    isFetchingRef.current = true;

    console.log("[OrdersList] Fetching orders...");
    try {
      const { data, error } = await getAllOrders();
      if (error) {
        console.error("[OrdersList] Error fetching orders:", error);
        toast.error("Failed to load orders");
      }
      if (data) {
        console.log(`[OrdersList] Loaded ${data.length} orders`);
        setOrders(data);
      }
    } catch (err) {
      console.error("[OrdersList] Exception:", err);
      toast.error("Failed to load orders");
    } finally {
      if (!silent) setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const debouncedReload = () => {
    if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
    reloadTimeoutRef.current = setTimeout(() => {
      loadOrders(true);
    }, 2500); // 2.5 second debounce
  };

  useEffect(() => {
    loadOrders();

    if (!supabaseConfigured) return;

    const subscription = supabase
      .channel("public:orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          console.log("Real-time update:", payload);
          debouncedReload();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
    };
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    // Real-time subscription will reload orders, but we can optimistically update too if needed
  };

  const filteredOrders = orders.filter((order) => {
    // Basic search on ID for now, customer name needs profile join which is TODO
    const matchesSearch =
      String(order.id).includes(search);
    // || order.customer?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Header Section - More compact on mobile */}
      <div className="px-4 sm:px-0">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Orders</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage and track customer orders (Real-time)
        </p>
      </div>

      <Card className="border-0 sm:border shadow-none sm:shadow-sm">
        <CardHeader className="px-4 sm:px-6 pb-3 sm:pb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <CardTitle className="text-lg sm:text-xl">All Orders ({filteredOrders.length})</CardTitle>

            {/* Search and Filter - Stacked on mobile */}
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search order ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 h-10">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6">
          {/* Status Filter Pills - Horizontal scroll on mobile */}
          <div className="px-4 sm:px-0 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${statusFilter === status
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-4">Order Info</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                        Loading orders...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No orders found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4 font-medium">
                      <span className="text-gray-900">#{order.id}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="text-gray-900 font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                        <span className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          {order.user_id.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-600 font-medium" title={order.user_id}>
                          Customer...{order.user_id.substring(0, 4)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-gray-900">
                      ₵{Number(order.total_price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          handleStatusUpdate(String(order.id), value)
                        }
                      >
                        <SelectTrigger className={`w-36 border-0 h-8 text-xs font-medium shadow-none focus:ring-0 ${order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                          order.status === 'processing' || order.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                              'bg-amber-50 text-amber-700'
                          }`}>
                          <div className="flex items-center gap-2">
                            <div className={`h-1.5 w-1.5 rounded-full ${order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-500' :
                              order.status === 'processing' || order.status === 'shipped' ? 'bg-blue-500' :
                                order.status === 'cancelled' ? 'bg-red-500' :
                                  'bg-amber-500'
                              }`} />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-gray-50 hover:bg-gray-100 text-gray-600"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View - Enhanced */}
          <div className="md:hidden space-y-3 px-4">
            {loading ? (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-200 border-t-gray-900" />
                  <p className="text-sm text-muted-foreground">Loading orders...</p>
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No orders found matching your criteria.</p>
              </div>
            ) : filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 pb-3 border-b border-gray-100">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-base truncate">Order #{order.id}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge
                      variant={statusColors[order.status as keyof typeof statusColors] || "default"}
                      className="flex-shrink-0"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50/50">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Total Price</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₵{Number(order.total_price).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Customer</p>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {order.user_id.substring(0, 2).toUpperCase()}
                      </div>
                      <p className="text-xs font-medium text-gray-700 truncate">
                        ...{order.user_id.substring(0, 8)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-3 flex gap-2 bg-white border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-xs font-medium"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" /> View Details
                  </Button>
                  <div className="flex-1">
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        handleStatusUpdate(String(order.id), value)
                      }
                    >
                      <SelectTrigger className={`w-full h-9 text-xs font-medium border-0 shadow-none ${order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                          order.status === 'processing' || order.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                              'bg-amber-50 text-amber-700'
                        }`}>
                        <div className="flex items-center gap-1.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-500' :
                              order.status === 'processing' || order.status === 'shipped' ? 'bg-blue-500' :
                                order.status === 'cancelled' ? 'bg-red-500' :
                                  'bg-amber-500'
                            }`} />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog - Responsive */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto mx-4">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl">Order Details - #{selectedOrder?.id}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Order placed on {selectedOrder && new Date(selectedOrder.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-5">
              {/* Address and Status Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="mb-3 font-semibold text-sm sm:text-base flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-900"></span>
                    Shipping Address
                  </h4>
                  <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-gray-900">{selectedOrder.shipping_address?.full_name}</p>
                    <p>{selectedOrder.shipping_address?.street}</p>
                    <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.postal_code}</p>
                    <p>{selectedOrder.shipping_address?.country}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="mb-3 font-semibold text-sm sm:text-base flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-900"></span>
                    Order Status
                  </h4>
                  <Badge
                    variant={statusColors[selectedOrder.status as keyof typeof statusColors] || "default"}
                    className="text-xs sm:text-sm px-3 py-1"
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="mb-3 font-semibold text-sm sm:text-base flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-900"></span>
                  Order Summary
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <>
                      {selectedOrder.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center gap-3 py-3 border-b border-gray-200 last:border-0">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {item.product?.image && (
                              <img
                                src={item.product?.image}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                                alt={item.product?.name}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm sm:text-base text-gray-900 truncate">
                                {item.product?.name || "Product"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.size} / {item.color} × {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-sm sm:text-base text-gray-900 flex-shrink-0">
                            ₵{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-gray-300">
                        <span className="font-bold text-base sm:text-lg text-gray-900">Total</span>
                        <span className="font-bold text-lg sm:text-xl text-gray-900">
                          ₵{Number(selectedOrder.total_price).toFixed(2)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground italic text-sm text-center py-4">
                      No items found for this order.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
