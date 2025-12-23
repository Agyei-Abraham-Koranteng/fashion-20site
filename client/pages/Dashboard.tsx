import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/lib/api";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart, User, Settings, Package, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function UserDashboard() {
    const { user } = useAuth();

    const { data: orders, isLoading } = useQuery({
        queryKey: ["user-orders", user?.id],
        queryFn: async () => {
            const { data } = await getOrders();
            // In a real app, we'd filter by user_id on the server, but for now we'll filter here
            return (data || []).filter((o: any) => o.user_id === user?.id);
        },
        enabled: !!user?.id,
    });

    const stats = [
        { name: "Orders", value: orders?.length || 0, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "Wishlist", value: 0, icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
        { name: "Reviews", value: 0, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    const statusColors = {
        pending: "bg-amber-100 text-amber-700",
        processing: "bg-blue-100 text-blue-700",
        shipped: "bg-purple-100 text-purple-700",
        delivered: "bg-emerald-100 text-emerald-700",
        cancelled: "bg-rose-100 text-rose-700",
    };

    return (
        <Layout>
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="container-wide max-w-6xl">
                    <header className="mb-10">
                        <h1 className="text-4xl font-bold font-serif text-gray-900">My Account</h1>
                        <p className="text-gray-500 mt-2">Welcome back, {user?.full_name || user?.username || "Fashionista"}!</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {stats.map((stat) => (
                            <motion.div
                                key={stat.name}
                                whileHover={{ y: -4 }}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5"
                            >
                                <div className={`p-4 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.name}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Recent Orders */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                                <CardHeader className="bg-white border-b px-8 py-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-serif">Recent Orders</CardTitle>
                                            <CardDescription>Track your latest purchases</CardDescription>
                                        </div>
                                        <Link to="/shop" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                            Continue Shopping <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {isLoading ? (
                                        <div className="p-12 text-center text-gray-500">Loading your orders...</div>
                                    ) : orders && orders.length > 0 ? (
                                        <div className="divide-y divide-gray-50">
                                            {orders.slice(0, 5).map((order: any) => (
                                                <div key={order.id} className="px-8 py-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <Package className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">Order #{order.id.substring(0, 8)}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {new Date(order.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-900">${Number(order.total_price).toFixed(2)}</p>
                                                        <Badge variant="outline" className={`mt-1.5 border-none ${statusColors[order.status as keyof typeof statusColors] || "bg-gray-100"}`}>
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-20 text-center">
                                            <ShoppingBag className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                                            <p className="text-lg font-medium text-gray-900">No orders yet</p>
                                            <p className="text-gray-500 mt-1 max-w-xs mx-auto">Looks like you haven't placed any orders with us yet. Start your journey today!</p>
                                            <Link to="/shop">
                                                <Button className="mt-6 rounded-full px-8">Explores Collections</Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-6">
                            <Card className="rounded-2xl border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Account Menu</CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 space-y-1">
                                    {[
                                        { label: "Profile Settings", icon: User, href: "/profile" },
                                        { label: "Wishlist", icon: Heart, href: "/wishlist" },
                                        { label: "Order History", icon: ShoppingBag, href: "/orders" },
                                        { label: "Preferred Style", icon: Settings, href: "/settings" },
                                    ].map((link) => (
                                        <Link
                                            key={link.label}
                                            to={link.href}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all group"
                                        >
                                            <link.icon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                            <span className="font-medium">{link.label}</span>
                                            <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>

                            <div className="bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h3 className="font-serif text-2xl font-bold leading-tight">Need help with an order?</h3>
                                    <p className="text-gray-400 mt-3 text-sm leading-relaxed">Our fashion consultants are available 24/7 to assist you with sizing and styling.</p>
                                    <Link to="/contact">
                                        <Button variant="outline" className="mt-6 border-white/20 hover:bg-white hover:text-black rounded-full transition-all">
                                            Contact Concierge
                                        </Button>
                                    </Link>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function Star(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}
