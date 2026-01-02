import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  User,
  Leaf,
  MessageSquare,
  Briefcase,
  Newspaper,
  Phone,
  HelpCircle,
  Truck,
  RotateCcw,
  Ruler,
  ChevronRight,
  Sparkles,
  Store
} from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const categories = [
  { name: "Women", href: "/shop?category=women" },
  { name: "Men", href: "/shop?category=men" },
  { name: "Accessories", href: "/shop?category=accessories" },
  { name: "New Arrivals", href: "/shop?sort=new" },
  { name: "Sale", href: "/shop?sort=sale" },
];

const brandLinks = [
  { name: "About Us", href: "/about", desc: "Our story and mission", icon: User },
];

const supportLinks = [
  { name: "Contact Us", href: "/contact", desc: "Get in touch with us", icon: Phone },
  { name: "FAQ", href: "/faq", desc: "Frequently asked questions", icon: HelpCircle },
  { name: "Shipping Info", href: "/shipping", desc: "Delivery options and tracking", icon: Truck },
  { name: "Returns", href: "/returns", desc: "Exchange and return policy", icon: RotateCcw },
  { name: "Size Guide", href: "/size-guide", desc: "Find your perfect fit", icon: Ruler },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value.trim();
      if (query) {
        navigate(`/shop?search=${encodeURIComponent(query)}`);
        setSearchOpen(false);
      }
    }
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      {/* Top bar with logo, search, and icons */}
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="text-xl font-bold tracking-wider text-primary">
              MadeInFashion
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Shop Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium tracking-wide">Shop</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {categories.map((cat) => (
                        <li key={cat.name}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={cat.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                            >
                              <div className="text-sm font-semibold leading-none text-primary group-hover:text-inherit">{cat.name}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-foreground/70 group-hover:text-inherit mt-1">
                                Explore our latest {cat.name.toLowerCase()} collection.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Brand Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium tracking-wide">Brand</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {brandLinks.map((item) => (
                        <li key={item.name}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                            >
                              <div className="flex items-center gap-2">
                                <item.icon size={16} className="text-primary group-hover:text-inherit" />
                                <div className="text-sm font-semibold leading-none text-primary group-hover:text-inherit">{item.name}</div>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-foreground/70 group-hover:text-inherit mt-1">{item.desc}</p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Support Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium tracking-wide">Support</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {supportLinks.map((item) => (
                        <li key={item.name}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                            >
                              <div className="flex items-center gap-2">
                                <item.icon size={16} className="text-primary group-hover:text-inherit" />
                                <div className="text-sm font-semibold leading-none text-primary group-hover:text-inherit">{item.name}</div>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-foreground/70 group-hover:text-inherit mt-1">{item.desc}</p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            {/* Admin Panel Quick Link */}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                <Store size={12} />
                ADMIN PANEL
              </Link>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Search icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-secondary rounded-sm transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="hidden sm:block p-2 hover:bg-secondary rounded-sm transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 hover:bg-secondary rounded-sm transition-colors relative"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => {
                if (user) {
                  navigate("/dashboard");
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="hidden sm:block p-2 hover:bg-secondary rounded-sm transition-colors relative"
              aria-label="Account"
            >
              <User size={20} />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-secondary rounded-sm transition-colors"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileMenuOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Search bar - visible when toggled */}
        {searchOpen && (
          <div className="pb-4 border-t border-border">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                autoFocus
                onKeyDown={handleSearch}
                className="w-full px-4 py-2 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Search
                size={18}
                className="absolute right-3 top-2.5 text-muted-foreground"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="md:hidden border-t border-border bg-background fixed inset-0 top-16 z-50 overflow-y-auto"
          >
            <div className="container-wide py-6 pb-20 space-y-8">
              <div className="grid grid-cols-3 gap-4 pb-6 border-b border-border">
                <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg">
                  <ThemeToggle />
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-2">Theme</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (user) navigate("/dashboard");
                    else setIsAuthModalOpen(true);
                  }}
                  className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg"
                >
                  <User size={24} className="mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">{user ? "Dashboard" : "Login"}</span>
                </button>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg group"
                >
                  <div className="relative">
                    <Heart size={24} className="mb-2" />
                    {wishlistItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {wishlistItems.length}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Wishlist</span>
                </Link>
              </div>

              {/* Shop Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Store size={18} className="text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Shop Collections</h3>
                </div>
                <div className="grid grid-cols-1 gap-y-4">
                  {categories.map((cat, idx) => (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.05 }}
                    >
                      <Link
                        to={cat.href}
                        className="flex items-center justify-between group"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="text-xl font-medium text-primary group-hover:translate-x-1 transition-transform">{cat.name}</span>
                        <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 border-t border-border pt-10">
                {/* Brand Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">The Brand</h3>
                  <div className="space-y-5">
                    {brandLinks.map((item, idx) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.05 }}
                      >
                        <Link
                          to={item.href}
                          className="flex items-center gap-4 group"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="p-2 bg-secondary rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <item.icon size={16} />
                          </div>
                          <span className="text-base font-medium text-primary">{item.name}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Support Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Support</h3>
                  <div className="space-y-5">
                    {supportLinks.map((item, idx) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.05 }}
                      >
                        <Link
                          to={item.href}
                          className="flex items-center gap-4 group"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="p-2 bg-secondary rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <item.icon size={16} />
                          </div>
                          <span className="text-base font-medium text-primary">{item.name}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Bottom extra info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="pt-10 border-t border-border flex flex-col items-center text-center space-y-4"
              >
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Sparkles size={16} className="text-accent" />
                  <span>PREMIUM FASHION EXPERIENCE</span>
                </div>
                <p className="text-xs text-muted-foreground tracking-widest uppercase">© 2025 MadeInFashion</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  );
}
