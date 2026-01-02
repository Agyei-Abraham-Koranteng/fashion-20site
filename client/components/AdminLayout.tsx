import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { getContactMessages } from "@/lib/api";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  FileText,
  Menu,
  Mail,
  MailOpen,
  Bell,
  Star,
  Activity,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

console.log("!!! ADMIN_LAYOUT_LOADED_V3 !!!");

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Messages", href: "/admin/messages", icon: MailOpen },
  { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { name: "Visitors", href: "/admin/visitors", icon: Activity },
  { name: "Feedback", href: "/admin/feedback", icon: Star },
  { name: "Product Reviews", href: "/admin/reviews", icon: Star },
  { name: "Content Manager", href: "/admin/content", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  console.log("[AdminLayout] Initializing with navigation:", navigation);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);

  // Fetch unread message count
  const { data: messages = [] } = useQuery({
    queryKey: ["contact_messages"],
    queryFn: async () => {
      const { data, error } = await getContactMessages();
      if (error) return [];
      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: !!user && user.role === "admin",
  });

  const unreadCount = messages.filter((msg: any) => msg.status === "unread").length;

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  // Check admin access
  if (authLoading) {
    return <div className="p-8 text-center">
      <div>Loading authentication...</div>
      <div className="text-sm text-gray-500 mt-2">Please wait while we check your login status</div>
    </div>;
  }

  console.log("AdminLayout check:", { user, authLoading, userRole: user?.role, userEmail: user?.email });

  if (!user) {
    console.log("Redirecting to admin login - not logged in");
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    return <Navigate to={`/admin/login?redirect=${redirect}`} replace />;
  }

  // Prevent redirect loop: User is logged in but not admin
  if (user.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <LogOut className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mb-8 max-w-md text-gray-600">
          You are logged in as <span className="font-semibold text-gray-900">{user.email}</span>,
          but this account does not have administrator privileges.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate("/")}>
            Go to Home
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  // Any logged-in user can now access admin panel

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        const isMessages = item.name === "Messages";
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all relative group",
              isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
            <span>{item.name}</span>
            {isActive && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full" />
            )}
            {isMessages && unreadCount > 0 && (
              <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const NotificationButton = () => (
    <div className="flex items-center gap-2">
      <Link
        to="/admin/messages"
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group"
        title="Messages"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    </div>
  );

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-primary text-slate-300 border-r border-slate-800 shadow-xl">
      <div className="flex h-20 items-center px-8 border-b border-slate-800/60 bg-primary/50 backdrop-blur-xl">
        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
          MadeInFashion
          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="V2 Deployment Active"></span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <NavLinks onClick={() => setOpen(false)} />
      </div>

      <div className="p-4 border-t border-slate-800/60 bg-primary/50">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 mb-3">
          <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.full_name || "Admin"}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-white/10 hover:text-white group"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex h-16 items-center border-b border-border bg-background/80 backdrop-blur-md px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-900 focus-visible:ring-indigo-500 transition-all active:scale-95"
            >
              <Menu className="h-6 w-6 stroke-[2.5]" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-0 bg-primary">
            <div className="sr-only">
              <SheetTitle>Admin Menu</SheetTitle>
              <SheetDescription>Navigation links for the admin panel</SheetDescription>
            </div>
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="ml-4 flex-1">
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            {navigation.find((item) => item.href === location.pathname)?.name || "Dashboard"}
          </span>
        </div>
        {/* Mobile Notification Button */}
        <NotificationButton />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-72">
        <SidebarContent />
      </div>

      {/* Desktop Top Bar with Notification */}
      <div className="hidden lg:flex lg:fixed lg:top-0 lg:left-72 lg:right-0 lg:z-40 h-20 items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-8 shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">
            {navigation.find((item) => item.href === location.pathname)?.name || "Dashboard"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your store efficiently</p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationButton />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 lg:pt-20">
        <main className="min-h-[calc(100vh-80px)] p-6 md:p-10 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
