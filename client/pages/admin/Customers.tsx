import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Trash2, UserX, Clock, MapPin } from "lucide-react";
import { deleteProfile } from "@/lib/api";
import { format, isAfter, subDays } from "date-fns";
import { cn } from "@/lib/utils";

export default function CustomersAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilter = searchParams.get("filter") === "active";

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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer "${name}"? This action cannot be undone.`)) return;

    try {
      const { error } = await deleteProfile(id);
      if (error) throw error;
      toast.success("Customer deleted successfully");
      loadCustomers(true);
    } catch (err) {
      console.error("[Customers] Delete error:", err);
      toast.error("Failed to delete customer");
    }
  };

  const isActive = (lastLogin: string | null) => {
    if (!lastLogin) return false;
    return isAfter(new Date(lastLogin), subDays(new Date(), 30));
  };

  const filteredCustomers = useMemo(() => {
    if (!activeFilter) return customers;
    return customers.filter(c => isActive(c.last_login));
  }, [customers, activeFilter]);

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

      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        <Button
          variant={!activeFilter ? "secondary" : "ghost"}
          size="sm"
          className={cn("h-8 text-xs", !activeFilter ? "bg-white shadow-sm" : "")}
          onClick={() => setSearchParams({})}
        >
          All Customers
        </Button>
        <Button
          variant={activeFilter ? "secondary" : "ghost"}
          size="sm"
          className={cn("h-8 text-xs", activeFilter ? "bg-white shadow-sm" : "")}
          onClick={() => setSearchParams({ filter: "active" })}
        >
          Active Only
          {activeFilter && <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
        </Button>
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
                  <TableHead>Last Active</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
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
                        <div className="flex items-center gap-2">
                          {isActive(customer.last_login) && (
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Active in last 30 days" />
                          )}
                          <span className="text-sm">
                            {customer.last_login
                              ? format(new Date(customer.last_login), "MMM d, yyyy")
                              : "Never"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.created_at
                          ? format(new Date(customer.created_at), "MMM d, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {!customer.is_admin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(customer.id, customer.full_name || customer.username)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
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
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="font-semibold uppercase tracking-wider">Active:</span>
                        <span className={cn(isActive(customer.last_login) ? "text-emerald-600 font-medium" : "")}>
                          {customer.last_login
                            ? format(new Date(customer.last_login), "MMM d")
                            : "Never"}
                        </span>
                      </div>
                      {!customer.is_admin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-red-400"
                          onClick={() => handleDelete(customer.id, customer.full_name || customer.username)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
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
