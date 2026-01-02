import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, ShoppingBag, Truck, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getProducts, getCmsContent } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/types";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { data: products, refetch: refetchProducts } = useQuery<Product[]>({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data } = await getProducts();
      return data || [];
    },
  });

  const { data: heroContent } = useQuery({
    queryKey: ["cms", "home_hero"],
    queryFn: async () => {
      const { data } = await getCmsContent("home_hero");
      return data?.content || null;
    },
  });

  const slides = heroContent?.slides || [
    {
      title: "The Art of Modern Elegance",
      subtitle: "Discover pieces that blend timeless sophistication with contemporary design. Crafted for those who appreciate the finer details.",
      image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
      cta_text: "Shop Collection",
      cta_link: "/shop",
      tagline: "New Collection 2025"
    }
  ];

  useEffect(() => {
    // Subscribe to real-time changes for products
    const subscription = supabase
      .channel('public:products:home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        refetchProducts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [refetchProducts]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const featuredProducts = products?.slice(0, 4) || [];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section - Slideshow */}
        <section className="relative h-[80vh] min-h-[600px] md:h-[90vh] bg-zinc-900 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0">
                <img
                  src={slides[currentSlide].image_url}
                  alt={slides[currentSlide].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              <div className="relative z-10 h-full flex items-center justify-center container-wide text-center pt-20 md:pt-0">
                <div className="max-w-4xl space-y-4 md:space-y-6">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-secondary uppercase tracking-[0.2em] text-[10px] md:text-sm font-semibold block"
                  >
                    {slides[currentSlide].tagline || "New Collection 2024"}
                  </motion.span>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-serif leading-tight text-white whitespace-pre-line px-4"
                  >
                    {slides[currentSlide].title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-base md:text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed px-6"
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center pt-6 px-4"
                  >
                    <div className="group relative w-full sm:w-auto">
                      {!user ? (
                        <Button
                          onClick={() => setIsAuthModalOpen(true)}
                          size="lg"
                          className="w-full sm:min-w-[200px] text-base h-12 md:h-14 bg-white text-black hover:bg-zinc-100 border-none transition-all"
                        >
                          Get Started
                        </Button>
                      ) : (
                        <Link to="/shop" className="w-full sm:w-auto block">
                          <Button size="lg" className="w-full sm:min-w-[200px] text-base h-12 md:h-14 bg-white text-black hover:bg-zinc-100 border-none transition-all">
                            Shop Collection
                          </Button>
                        </Link>
                      )}
                    </div>
                    <Link to="/about" className="w-full sm:w-auto block">
                      <Button size="lg" variant="outline" className="w-full sm:min-w-[200px] text-base h-12 md:h-14 border-white text-white hover:bg-white hover:text-black bg-transparent transition-all">
                        Our Story
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full border border-white/20 bg-black/10 text-white hover:bg-white hover:text-black transition-all hidden sm:flex"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full border border-white/20 bg-black/10 text-white hover:bg-white hover:text-black transition-all hidden sm:flex"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-3">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1 md:h-1.5 transition-all duration-300 rounded-full ${currentSlide === idx ? "w-8 md:w-12 bg-white" : "w-1.5 md:w-2 bg-white/40 hover:bg-white/60"
                      }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Featured Categories */}
        <section className="section-padding container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-3 md:mb-4">Curated Collections</h2>
            <p className="text-sm md:text-base text-muted-foreground px-4">Explore our most popular categories for the season</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { name: "Women's Collection", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1000", link: "/shop?category=women" },
              { name: "Men's Essentials", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1000", link: "/shop?category=men" },
              { name: "Accessories", image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&q=80&w=1000", link: "/shop?category=accessories" }
            ].map((cat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative h-[400px] md:h-[500px] overflow-hidden rounded-sm cursor-pointer shadow-md"
              >
                <Link to={cat.link}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white z-10">
                    <h3 className="text-2xl md:text-3xl font-serif mb-2">{cat.name}</h3>
                    <div className="flex items-center gap-2 text-xs md:text-sm font-medium uppercase tracking-wide opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      Explore <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-16 md:py-24 bg-secondary/20">
          <div className="container-wide">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 md:mb-12 px-4 md:px-0">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif mb-2">New Arrivals</h2>
                <p className="text-sm md:text-base text-muted-foreground">Fresh styles just landed in our store</p>
              </div>
              <Link to="/shop" className="w-full sm:w-auto">
                <Button variant="link" className="text-primary font-semibold p-0 h-auto">View All <ArrowRight className="ml-2 w-4 h-4" /></Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 px-4 md:px-0">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                [1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-[300px] md:h-[400px] bg-muted animate-pulse rounded-md" />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 md:section-padding container-wide border-t border-border/40">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center md:divide-x divide-border/60">
            {[
              { icon: Star, title: "Premium Quality", desc: "Crafted with the finest materials." },
              { icon: Truck, title: "Fast Shipping", desc: "Free on orders over ₵150." },
              { icon: Shield, title: "Secure Payment", desc: "100% secure checkout." },
              { icon: ShoppingBag, title: "Easy Returns", desc: "30-day return policy." },
            ].map((feat, idx) => (
              <div key={idx} className="p-4 md:p-6 flex flex-col items-center">
                <feat.icon className="w-6 h-6 md:w-8 md:h-8 mb-3 md:mb-4 text-primary opacity-80" />
                <h4 className="text-sm md:text-lg font-bold mb-1 md:mb-2 font-serif">{feat.title}</h4>
                <p className="text-[10px] md:text-sm text-muted-foreground">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView="signup"
      />
    </Layout>
  );
}
