import { useState, useEffect } from "react";
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

  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
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
    }
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
          loadOrders(true);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">
          Manage and track customer orders (Real-time)
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search order ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
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
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${statusFilter === status
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
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
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
            ) : filteredOrders.map((order) => (
              <div key={order.id} className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900">Order #{order.id}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={statusColors[order.status as keyof typeof statusColors] || "default"}>
                    {order.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-y border-gray-50 bg-gray-50/50 -mx-4 px-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Total Price</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      ${Number(order.total_price).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Customer ID</p>
                    <p className="text-sm font-medium text-gray-700 mt-1 truncate">
                      {order.user_id.substring(0, 12)}...
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-4 w-4 mr-2" /> View Details
                  </Button>
                  <div className="flex-[1.5]">
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        handleStatusUpdate(String(order.id), value)
                      }
                    >
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="Update Status" />
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

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Order placed on {selectedOrder && new Date(selectedOrder.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-semibold">Shipping Address</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>{selectedOrder.shipping_address?.full_name}</p>
                    <p>{selectedOrder.shipping_address?.street}</p>
                    <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.postal_code}</p>
                    <p>{selectedOrder.shipping_address?.country}</p>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Order Status</h4>
                  <Badge variant={statusColors[selectedOrder.status as keyof typeof statusColors] || "default"}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Order Summary</h4>
                <div className="space-y-2 text-sm mt-2">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b">
                        <div className="flex items-center gap-2">
                          {item.product?.image && <img src={item.product?.image} className="w-8 h-8 rounded object-cover" />}
                          <div>
                            <p className="font-medium">{item.product?.name || "Product"}</p>
                            <p className="text-xs text-muted-foreground">{item.size} / {item.color} x {item.quantity}</p>
                          </div>
                        </div>
                        <span>₵{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">No items found for this order.</p>
                  )}
                  <div className="flex justify-between pt-4 font-semibold text-lg">
                    <span>Total</span>
                    <span>₵{Number(selectedOrder.total_price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
