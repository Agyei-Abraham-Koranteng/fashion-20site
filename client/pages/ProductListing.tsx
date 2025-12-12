import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import { Product } from "@/lib/types";
import { ChevronDown, X } from "lucide-react";

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
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

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const { data } = await getProducts({
        category: category || undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        search: searchQuery || undefined,
      });

      if (data) {
        let sorted = [...data];

        // Sort products
        if (sortBy === "price-low") {
          sorted.sort(
            (a, b) => (a.sale_price || a.price) - (b.sale_price || b.price),
          );
        } else if (sortBy === "price-high") {
          sorted.sort(
            (a, b) => (b.sale_price || b.price) - (a.sale_price || a.price),
          );
        } else if (sortBy === "new") {
          sorted.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );
        } else if (sortBy === "sale") {
          sorted.sort((a, b) => {
            const aDiscount = a.sale_price ? a.price - a.sale_price : 0;
            const bDiscount = b.sale_price ? b.price - b.sale_price : 0;
            return bDiscount - aDiscount;
          });
        }

        setProducts(sorted);
      }

      setLoading(false);
    }

    loadProducts();
  }, [category, searchQuery, priceRange, sortBy]);

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
      {/* Header */}
      <section className="bg-secondary py-12">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {category
              ? `${category.charAt(0).toUpperCase() + category.slice(1)}`
              : "Shop"}
          </h1>
          <p className="text-muted-foreground">
            {products.length} products available
          </p>
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
                      max="500"
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
                      max="500"
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
                    max="500"
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
                      className={`relative w-12 h-12 rounded-sm border-2 transition-all ${
                        selectedColors.includes(color.hex)
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
                      className={`py-2 px-3 text-sm font-medium rounded-sm border transition-colors ${
                        selectedSizes.includes(size)
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
            {loading ? (
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
