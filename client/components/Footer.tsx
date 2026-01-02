import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import ReviewSection from "./ReviewSection";

const footerSections = [
  {
    title: "Shop",
    links: [
      { name: "Women", href: "/shop?category=women" },
      { name: "Men", href: "/shop?category=men" },
      { name: "Accessories", href: "/shop?category=accessories" },
      { name: "New Arrivals", href: "/shop?sort=new" },
      { name: "Sale", href: "/shop?sort=sale" },
    ],
  },
  {
    title: "Help",
    links: [
      { name: "Contact Us", href: "/contact" },
      { name: "Shipping Info", href: "/shipping" },
      { name: "Returns", href: "/returns" },
      { name: "FAQ", href: "/faq" },
      { name: "Size Guide", href: "/size-guide" },
    ],
  },
  {
    title: "About",
    links: [
      { name: "About Us", href: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email });

      if (error) {
        if (error.code === "23505") {
          toast.error("You are already subscribed!");
        } else {
          console.error("Newsletter error:", error);
          toast.error("Failed to subscribe. Please try again.");
        }
      } else {
        toast.success("Successfully subscribed to the newsletter!");
        setEmail("");
      }
    } catch (err) {
      console.error("Newsletter exception:", err);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#0f172a] text-slate-100 border-t border-slate-800 dark:bg-[#0f172a] dark:border-slate-800">
      <div className="container-wide py-10 md:py-16">
        {/* Footer sections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold tracking-wider mb-4 uppercase text-white">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter and social */}
        <div className="border-t border-slate-800 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Newsletter */}
            <div>
              <h3 className="text-sm font-semibold tracking-wider mb-3 uppercase text-white">
                Subscribe to our Newsletter
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Get exclusive offers and updates delivered to your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent text-sm rounded-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-accent text-accent-foreground font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 rounded-sm"
                >
                  {loading ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            </div>

            {/* Review Section */}
            <div>
              <ReviewSection />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>&copy; 2025 MadeInFashion. All rights reserved.</p>
            <div className="flex gap-6">
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
