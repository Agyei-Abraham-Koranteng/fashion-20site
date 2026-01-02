import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { getAdminStats, getAllOrders } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users, Star } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    activeCustomers: 0,
    totalVisitors: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Refs for debouncing and concurrency control
  const isFetchingRef = useRef(false);
  const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = async (silent = false) => {
    // Basic guard against overlapping fetches
    if (isFetchingRef.current) {
      console.log("[Dashboard] Load already in progress, skipping...");
      return;
    }

    if (!silent) setLoading(true);
    isFetchingRef.current = true;

    try {
      console.log("[Dashboard] Loading data...");
      // Load stats, orders, and visitors in parallel
      const [statsResult, ordersResult, visitorsResult] = await Promise.allSettled([
        getAdminStats(),
        getAllOrders(),
        supabase.from('site_visits').select('*', { count: 'exact', head: true }),
      ]);

      // Handle stats
      if (statsResult.status === "fulfilled" && statsResult.value.data) {
        setStatsData(prev => ({ ...prev, ...statsResult.value.data }));
      }

      // Handle visitors
      if (visitorsResult.status === "fulfilled" && visitorsResult.value.count !== null) {
        setStatsData(prev => ({ ...prev, totalVisitors: visitorsResult.value.count || 0 }));
      }

      // Handle orders
      if (ordersResult.status === "fulfilled" && ordersResult.value.data) {
        const allOrders = ordersResult.value.data;
        setRecentOrders(allOrders.slice(0, 5));

        // 1. Calculate Revenue Overview (Past 6 months)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const revenueMap: Record<string, number> = {};

        // Initialize last 6 months with 0
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          revenueMap[monthNames[d.getMonth()]] = 0;
        }

        allOrders.forEach(order => {
          const date = new Date(order.created_at);
          const month = monthNames[date.getMonth()];
          if (revenueMap[month] !== undefined) {
            revenueMap[month] += Number(order.total_price);
          }
        });

        setRevenueData(Object.entries(revenueMap).map(([month, revenue]) => ({ month, revenue })));

        // 2. Calculate Orders This Week (Past 7 days)
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const ordersMap: Record<string, number> = {};

        // Initialize past 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          ordersMap[dayNames[d.getDay()]] = 0;
        }

        allOrders.forEach(order => {
          const date = new Date(order.created_at);
          const day = dayNames[date.getDay()];
          // Only count if within last 7 days
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          if (date >= sevenDaysAgo && ordersMap[day] !== undefined) {
            ordersMap[day] += 1;
          }
        });

        // Special case: if we have very little data, include the days anyway in correct order
        const daysOrder = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          daysOrder.push(dayNames[d.getDay()]);
        }

        setOrdersData(daysOrder.map(day => ({ day, orders: ordersMap[day] })));
      } else {
        console.warn("Failed to load orders:", ordersResult.status === "rejected" ? ordersResult.reason : ordersResult.value?.error);
      }

      // Only show error toast if BOTH failed
      if (statsResult.status === "rejected" && ordersResult.status === "rejected") {
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Dashboard load failed:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      if (!silent) setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const debouncedReload = () => {
    if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
    reloadTimeoutRef.current = setTimeout(() => {
      loadData(true);
    }, 2500); // 2.5 second debounce for real-time updates
  };

  useEffect(() => {
    loadData();

    if (!supabaseConfigured) return;

    // Subscribe to real-time updates for orders, products, and profiles
    const ordersChannel = supabase
      .channel("admin-dashboard-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => debouncedReload()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => debouncedReload()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => debouncedReload()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            name: "Total Revenue",
            val: `₵${statsData.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            name: "Orders",
            val: statsData.totalOrders.toLocaleString(),
            icon: ShoppingCart,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            name: "Products",
            val: statsData.totalProducts.toLocaleString(),
            icon: Package,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
          {
            name: "Active Customers",
            val: statsData.activeCustomers.toLocaleString(),
            icon: Users,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
          },
          {
            name: "Total Visitors",
            val: statsData.totalVisitors.toLocaleString(),
            icon: Users,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
          },
          {
            name: "Feedback",
            val: "Click to View",
            href: "/admin/feedback",
            icon: Star,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
          },
        ].map((stat) => (
          <Link key={stat.name} to={stat.href || "#"}>
            <Card className="border-none shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-white/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <div className={`p-2 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center pt-2">
                  <div className="text-2xl font-bold">{stat.val}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span className="text-emerald-500 font-medium">+12%</span> from last month
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="col-span-full lg:col-span-4 border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Monthly revenue performance</p>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₵${value}`}
                  />
                  <Tooltip
                    contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Orders Chart */}
        <Card className="col-span-full lg:col-span-3 border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Weekly Orders</CardTitle>
            <p className="text-sm text-muted-foreground">Orders activity past 7 days</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersData}>
                  <XAxis
                    dataKey="day"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar
                    dataKey="orders"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders - Mini Table */}
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <p className="text-sm text-muted-foreground">Latest transactions from your store</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent orders found.</p>
            ) : (
              recentOrders.map((order, i) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-lg bg-white/60 border border-gray-100 hover:bg-white transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₵{Number(order.total_price).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback - Mini Table */}
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm mt-6">
        <CardHeader>
          <CardTitle>Recent System Feedback</CardTitle>
          <p className="text-sm text-muted-foreground">What users are saying about the site</p>
        </CardHeader>
        <CardContent>
          <SystemFeedbackList />
        </CardContent>
      </Card>
    </div>
  );
}

// Simple component to list feedback
import { getSystemFeedback } from "@/lib/api";

function SystemFeedbackList() {
  const [feedback, setFeedback] = useState<any[]>([]);

  useEffect(() => {
    getSystemFeedback().then(({ data, error }) => {
      if (error) {
        console.warn("[Dashboard] Feedback blocked by RLS. Run SQL fixes.");
        return;
      }
      if (data) setFeedback(data.slice(0, 5));
    });

    // Subscribe to new feedback
    const channel = supabase
      .channel('feedback-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_feedback' }, (payload) => {
        setFeedback(prev => [payload.new, ...prev].slice(0, 5));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (feedback.length === 0) return <p className="text-muted-foreground text-sm">No feedback yet.</p>;

  return (
    <div className="space-y-4">
      {feedback.map((item, i) => (
        <div key={item.id || i} className="flex items-start gap-4 p-4 rounded-lg bg-white/60 border border-gray-100">
          <div className="flex gap-1 mt-1">
            {[...Array(5)].map((_, j) => (
              <Star
                key={j}
                className={`w-4 h-4 ${j < item.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
              />
            ))}
          </div>
          <div>
            <p className="text-sm text-gray-800">{item.feedback}</p>
            <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
