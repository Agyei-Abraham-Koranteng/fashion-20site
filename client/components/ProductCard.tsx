import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Product } from "@/lib/types";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isWishlisted, addItem, removeItem } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const mainImage = product.images?.[0];
  const salePrice = product.sale_price;
  const discount = salePrice
    ? Math.round(((product.price - salePrice) / product.price) * 100)
    : 0;

  return (
    <div className="group cursor-pointer animate-fade-in">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative bg-secondary overflow-hidden rounded-sm mb-4">
          {/* Image */}
          <div className="aspect-square overflow-hidden">
            <img
              src={
                mainImage?.url ||
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
              }
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Sale badge */}
          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-accent text-accent-foreground text-xs font-bold px-2 py-1">
              -{discount}%
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              wishlisted ? removeItem(product.id) : addItem(product);
            }}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-all duration-200 shadow-sm"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={18}
              className={
                wishlisted ? "fill-current text-accent" : "text-primary"
              }
            />
          </button>

          {/* Quick add button (shown on hover) */}
          <span
            className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground py-2 text-sm font-medium text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            Quick View
          </span>
        </div>

        {/* Product info */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground tracking-wide uppercase">
            {product.category?.name || "Category"}
          </p>
          <h3 className="text-sm font-medium text-primary line-clamp-2 group-hover:text-primary/70 transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            {salePrice ? (
              <>
                <span className="text-sm font-semibold text-primary">
                  ${salePrice.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-primary">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Colors indicator */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-2 mt-2">
              {product.colors.slice(0, 3).map((color) => (
                <div
                  key={color}
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: color || "#ccc" }}
                  title={color}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{product.colors.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
