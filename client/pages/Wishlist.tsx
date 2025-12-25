import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { Heart } from "lucide-react";

export default function Wishlist() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-wide py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">🎁</div>
            <h1 className="text-3xl font-bold mb-4">Your wishlist is empty</h1>
            <p className="text-muted-foreground mb-8">
              Start adding items to your wishlist to save them for later.
            </p>
            <Link to="/shop" className="btn-primary inline-block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="bg-secondary py-12">
        <div className="container-wide">
          <div className="flex items-center gap-3 mb-2">
            <Heart size={32} className="text-accent fill-current" />
            <h1 className="text-3xl md:text-4xl font-bold">My Wishlist</h1>
          </div>
          <p className="text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </section>

      {/* Wishlist items */}
      <div className="container-wide py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/shop" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </Layout>
  );
}
