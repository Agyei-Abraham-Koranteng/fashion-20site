import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import { Product } from "@/lib/types";
import { ChevronDown, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const category = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || "featured";

  // Color options
  const colors = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#ffffff" },
    { name: "Blue", hex: "#1a3a52" },
    { name: "Red", hex: "#ff0000" },
    { name: "Pink", hex: "#ff69b4" },
    { name: "Gray", hex: "#808080" },
  ];

  // Size options
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  // Local Debounce for Price Range
  const [debouncedPriceRange, setDebouncedPriceRange] = useState(priceRange);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 500);
    return () => clearTimeout(timer);
  }, [priceRange]);

  const { data: products = [], isLoading, isError, error, refetch } = useQuery<Product[]>({
    queryKey: ["products", category, searchQuery, debouncedPriceRange, sortBy],
    queryFn: async () => {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), 10000)
      );

      // Race the fetch against the timeout
      const response = await Promise.race([
        getProducts({
          category: category || undefined,
          minPrice: debouncedPriceRange[0],
          maxPrice: debouncedPriceRange[1],
          search: searchQuery || undefined,
        }),
        timeoutPromise
      ]) as any;

      const { data, error } = response;
      if (error) throw error;

      let sorted = data ? [...data] : [];

      if (sortBy === "price-low") {
        sorted.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
      } else if (sortBy === "price-high") {
        sorted.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
      } else if (sortBy === "new") {
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (sortBy === "sale") {
        sorted.sort((a, b) => {
          const aDiscount = a.sale_price ? a.price - a.sale_price : 0;
          const bDiscount = b.sale_price ? b.price - b.sale_price : 0;
          return bDiscount - aDiscount;
        });
      }
      return sorted;
    },
  });

  useEffect(() => {
    const subscription = supabase
      .channel('public:products:listing')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);

  const handleSortChange = (value: string) => {
    setSearchParams((prev) => {
      prev.set("sort", value);
      return prev;
    });
  };

  const handleColorToggle = (colorHex: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorHex)
        ? prev.filter((c) => c !== colorHex)
        : [...prev, colorHex],
    );
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  return (
    <Layout>
      {/* Modern Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden flex items-center">
        {/* Background Animation/Image Placeholder */}
        <div className="absolute inset-0 bg-neutral-900">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>

        <div className="container-wide relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
              {category
                ? `${category.charAt(0).toUpperCase() + category.slice(1)}`
                : "The Collection"}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed mb-6">
              Discover our curated selection of premium pieces, designed for those who appreciate the finer details of modern elegance.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium tracking-widest uppercase text-primary/60">
              <span className="w-8 h-px bg-primary/40" />
              <span>{products.length} Exquisite Pieces</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <div className="container-wide py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <div
            className={`${filtersOpen ? "block" : "hidden"} lg:block lg:w-64 flex-shrink-0`}
          >
            <div className="space-y-6">
              {/* Filters header for mobile */}
              <div className="lg:hidden flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Filters</h3>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="p-1 hover:bg-secondary rounded-sm"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Price filter */}
              <div className="border-b border-border pb-6">
                <h3 className="text-sm font-semibold tracking-wider uppercase mb-4">
                  Price
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="number"
                      min="0"
                      max="5000"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                      }
                      className="w-20 px-2 py-1 border border-border rounded-sm text-sm"
                      placeholder="Min"
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      type="number"
                      min="0"
                      max="5000"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      className="w-20 px-2 py-1 border border-border rounded-sm text-sm"
                      placeholder="Max"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Color filter */}
              <div className="border-b border-border pb-6">
                <h3 className="text-sm font-semibold tracking-wider uppercase mb-4">
                  Color
                </h3>
                <div className="grid grid-cols-3 lg:grid-cols-2 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => handleColorToggle(color.hex)}
                      className={`relative w-12 h-12 rounded-sm border-2 transition-all ${selectedColors.includes(color.hex)
                        ? "border-primary"
                        : "border-border"
                        }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColors.includes(color.hex) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size filter */}
              <div className="border-b border-border pb-6">
                <h3 className="text-sm font-semibold tracking-wider uppercase mb-4">
                  Size
                </h3>
                <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`py-2 px-3 text-sm font-medium rounded-sm border transition-colors ${selectedSizes.includes(size)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary border-border hover:border-primary"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden btn-secondary px-4 py-2 text-sm flex items-center gap-2"
              >
                Filters
                <ChevronDown size={16} />
              </button>

              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="featured">Featured</option>
                <option value="new">Newest</option>
                <option value="sale">Best Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-secondary aspect-square rounded-sm mb-4" />
                    <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                    <div className="h-4 bg-secondary rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg mb-4">
                  Failed to load products. {(error as any)?.message || "Please try again later."}
                </p>
                <button onClick={() => refetch()} className="btn-secondary">
                  Try Again
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  No products found with your filters.
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
