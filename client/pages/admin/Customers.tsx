import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { getCustomers } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Refs for debouncing and concurrency control
  const isFetchingRef = useRef(false);
  const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadCustomers = async (silent = false) => {
    if (isFetchingRef.current) return;

    if (!silent) setLoading(true);
    isFetchingRef.current = true;

    console.log("[Customers] Fetching customers...");
    try {
      const { data, error } = await getCustomers();
      if (error) {
        console.error("[Customers] Error fetching customers:", error);
        toast.error("Failed to load customers");
      }
      if (data) {
        console.log(`[Customers] Loaded ${data.length} customers`);
        setCustomers(data);
      }
    } catch (err) {
      console.error("[Customers] Exception:", err);
      toast.error("Failed to load customers");
    } finally {
      if (!silent) setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const debouncedReload = () => {
    if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
    reloadTimeoutRef.current = setTimeout(() => {
      loadCustomers(true);
    }, 2500); // 2.5 second debounce
  };

  useEffect(() => {
    loadCustomers();

    const subscription = supabase
      .channel("public:profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => debouncedReload()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <p className="text-muted-foreground">
          Manage your customer base (Real-time)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Customer</TableHead>
                  <TableHead className="min-w-[200px]">Email/Username</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={customer.avatar_url} />
                            <AvatarFallback>
                              {customer.full_name?.charAt(0) || customer.username?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {customer.full_name || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{customer.username || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={customer.is_admin ? "default" : "secondary"}>
                          {customer.is_admin ? "Admin" : "Customer"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customer.updated_at
                          ? new Date(customer.updated_at).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No customers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading customers...</div>
            ) : customers.length > 0 ? (
              customers.map((customer) => (
                <div key={customer.id} className="p-4 flex items-center gap-4">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={customer.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {customer.full_name?.charAt(0) || customer.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 truncate pr-2">
                        {customer.full_name || "N/A"}
                      </h4>
                      <Badge variant={customer.is_admin ? "default" : "secondary"} className="scale-90 origin-right">
                        {customer.is_admin ? "Admin" : "User"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {customer.username || "No Email"}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
                      <span className="font-semibold uppercase tracking-wider">Joined:</span>
                      <span>
                        {customer.updated_at
                          ? new Date(customer.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground font-medium">No customers found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
