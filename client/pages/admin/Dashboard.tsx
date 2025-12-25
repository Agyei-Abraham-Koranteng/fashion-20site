import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getAdminStats, getAllOrders } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
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
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    const [statsRes, ordersRes] = await Promise.all([
      getAdminStats(),
      getAllOrders(),
    ]);

    if (statsRes.data) {
      setStatsData(statsRes.data);
    }

    if (ordersRes.data) {
      const allOrders = ordersRes.data;
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
    }

    if (!silent) setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Subscribe to real-time updates for orders, products, and profiles
    const ordersChannel = supabase
      .channel("admin-dashboard-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => loadData(true)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => loadData(true)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => loadData(true)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  const stats = [
    {
      name: "Total Revenue",
      value: `$${statsData.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "Live Database",
      icon: DollarSign,
    },
    {
      name: "Orders",
      value: statsData.totalOrders.toLocaleString(),
      change: "Live Database",
      icon: ShoppingCart,
    },
    {
      name: "Products",
      value: statsData.totalProducts.toLocaleString(),
      change: "Live Database",
      icon: Package,
    },
    {
      name: "Active Customers",
      value: statsData.activeCustomers.toLocaleString(),
      change: "Live Database",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">MadeInFashion Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's the latest Activity for MadeInFashion (Real-time).
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.shipping_address?.full_name || "Guest User"} - {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${Number(order.total_price).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">No recent orders.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
