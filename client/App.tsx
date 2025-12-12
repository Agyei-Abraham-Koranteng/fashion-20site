import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

import Home from "./pages/HomeSimple";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <WishlistProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<ProductListing />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              {/* Placeholder routes */}
              <Route path="/contact" element={<NotFound />} />
              <Route path="/shipping" element={<NotFound />} />
              <Route path="/returns" element={<NotFound />} />
              <Route path="/faq" element={<NotFound />} />
              <Route path="/size-guide" element={<NotFound />} />
              <Route path="/about" element={<NotFound />} />
              <Route path="/careers" element={<NotFound />} />
              <Route path="/press" element={<NotFound />} />
              <Route path="/blog" element={<NotFound />} />
              <Route path="/sustainability" element={<NotFound />} />
              <Route path="/privacy" element={<NotFound />} />
              <Route path="/terms" element={<NotFound />} />
              <Route path="/cookies" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WishlistProvider>
    </CartProvider>
  </QueryClientProvider>
);

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
