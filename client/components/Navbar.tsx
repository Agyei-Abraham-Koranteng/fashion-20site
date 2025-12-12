import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const categories = [
  { name: "Women", href: "/shop?category=women" },
  { name: "Men", href: "/shop?category=men" },
  { name: "Accessories", href: "/shop?category=accessories" },
  { name: "New Arrivals", href: "/shop?sort=new" },
  { name: "Sale", href: "/shop?sort=sale" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      {/* Top bar with logo, search, and icons */}
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="text-xl font-bold tracking-wider text-primary">LUXE</div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.href}
                className="text-sm font-medium text-primary hover:text-primary/70 transition-colors tracking-wide"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4">
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
              className="p-2 hover:bg-secondary rounded-sm transition-colors relative"
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

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-secondary rounded-sm transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
                className="w-full px-4 py-2 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Search size={18} className="absolute right-3 top-2.5 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="container-wide py-4 space-y-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.href}
                className="block text-sm font-medium text-primary hover:text-primary/70 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
