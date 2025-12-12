import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import { Product } from "@/lib/types";
import { ChevronRight } from "lucide-react";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const { data } = await getProducts();
      if (data) {
        setFeaturedProducts(data.slice(0, 4));
        setTrendingProducts(data.slice(2, 6));
      }
      setLoading(false);
    }

    loadProducts();
  }, []);

  return (
    <Layout>
      {/* Hero banner */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop"
            alt="Hero background"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative container-wide py-32 md:py-48">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-wide">
              Elegance Redefined
            </h1>
            <p className="text-lg md:text-xl mb-8 text-primary-foreground/90">
              Discover our curated collection of luxury fashion for the modern
              lifestyle. Timeless pieces, exceptional quality, and
              uncompromising style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/shop?sort=new"
                className="btn-primary inline-flex items-center justify-center gap-2 text-center"
              >
                Shop New Arrivals
                <ChevronRight size={18} />
              </Link>
              <Link
                to="/shop?sort=sale"
                className="btn-outline inline-flex items-center justify-center gap-2 text-center text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
              >
                View Sale
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products section */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Featured Collection
              </h2>
              <p className="text-muted-foreground">
                Handpicked styles for the season
              </p>
            </div>
            <Link
              to="/shop"
              className="text-sm font-medium text-primary hover:text-primary/70 transition-colors flex items-center gap-2 tracking-wide"
            >
              View All
              <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-secondary aspect-square rounded-sm mb-4" />
                  <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                  <div className="h-4 bg-secondary rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Marketing banner */}
      <section className="bg-secondary py-16">
        <div className="container-wide text-center">
          <h3 className="text-2xl font-semibold mb-4">
            Premium Quality, Accessible Prices
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            We believe in sustainable fashion that doesn't compromise on style.
            Every piece is carefully selected to ensure quality and longevity.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚚</span>
              <span>Free Shipping on Orders Over $100</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">↩️</span>
              <span>30-Day Easy Returns</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trending section */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Trending Now
              </h2>
              <p className="text-muted-foreground">
                What everyone is wearing this season
              </p>
            </div>
            <Link
              to="/shop"
              className="text-sm font-medium text-primary hover:text-primary/70 transition-colors flex items-center gap-2 tracking-wide"
            >
              View All
              <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-secondary aspect-square rounded-sm mb-4" />
                  <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                  <div className="h-4 bg-secondary rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-wide text-center">
          <h3 className="text-3xl font-bold mb-4">Join Our Community</h3>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Get exclusive access to new collections, special sales, and style
            tips. Subscribe to our newsletter today.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 text-primary bg-primary-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <button type="submit" className="btn-accent px-8 py-3 font-medium">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
