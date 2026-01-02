import "./global.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";

import Home from "./pages/Home";
import ScrollToTop from "./components/ScrollToTop";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import SizeGuide from "./pages/SizeGuide";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ComingSoon from "./pages/ComingSoon";
import CmsPage from "./components/CmsPage";

// Admin Pages
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/Dashboard";
import ProductsListAdmin from "./pages/admin/ProductsList";
import ProductFormAdmin from "./pages/admin/ProductForm";
import OrdersListAdmin from "./pages/admin/OrdersList";
import CustomersAdmin from "./pages/admin/Customers";
import SettingsAdmin from "./pages/admin/Settings";
import NewsletterAdmin from "./pages/admin/Newsletter";
import ContentManager from "./pages/admin/ContentManager";
import MessagesAdmin from "./pages/admin/Messages";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSignUp from "./pages/admin/AdminSignUp";
import FeedbackAdmin from "./pages/admin/Feedback";
import ProductReviewsAdmin from "./pages/admin/ProductReviews";
import VisitorAnalyticsAdmin from "./pages/admin/VisitorAnalytics";

// Lazy-loaded pages
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

const queryClient = new QueryClient();

import { useVisitorTracker } from "./hooks/useVisitorTracker";

const App = () => {
  useVisitorTracker();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<ProductListing />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/checkout" element={<Checkout />} />

                    {/* Auth */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Admin Auth */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/signup" element={<AdminSignUp />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<ProductsListAdmin />} />
                      <Route path="products/new" element={<ProductFormAdmin />} />
                      <Route path="products/:id/edit" element={<ProductFormAdmin />} />
                      <Route path="orders" element={<OrdersListAdmin />} />
                      <Route path="customers" element={<CustomersAdmin />} />
                      <Route path="newsletter" element={<NewsletterAdmin />} />
                      <Route path="messages" element={<MessagesAdmin />} />
                      <Route path="feedback" element={<FeedbackAdmin />} />
                      <Route path="reviews" element={<ProductReviewsAdmin />} />
                      <Route path="visitors" element={<VisitorAnalyticsAdmin />} />
                      <Route path="content" element={<ContentManager />} />
                      <Route path="settings" element={<SettingsAdmin />} />
                    </Route>

                    {/* Static Pages */}
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/size-guide" element={<SizeGuide />} />
                    <Route path="/shipping" element={<Shipping />} />
                    <Route path="/returns" element={<Returns />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/cookies" element={<CmsPage slug="cookie_policy" defaultTitle="Cookie Policy" />} />
                    <Route path="/careers" element={<CmsPage slug="careers" defaultTitle="Careers" />} />
                    <Route path="/press" element={<CmsPage slug="press" defaultTitle="Press" />} />
                    <Route path="/blog" element={<CmsPage slug="blog" defaultTitle="Blog" />} />
                    <Route path="/sustainability" element={<CmsPage slug="sustainability" defaultTitle="Sustainability" />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
