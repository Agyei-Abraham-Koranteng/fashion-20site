import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Layout from "@/components/Layout";
import { getProductById, getProductReviews, addProductReview } from "@/lib/api";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, ShoppingBag, Truck, RotateCcw, Star } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_SIZES = ["S", "M", "L", "XL"];
const DEFAULT_COLORS = ["#000000", "#FFFFFF", "#1a3a52", "#808080"];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, title: "", comment: "", user_name: "" });
  const [reviewSort, setReviewSort] = useState<"newest" | "highest" | "lowest">("newest");

  const { addItem } = useCart();
  const {
    isWishlisted,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
  } = useWishlist();

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const { error } = await addProductReview({
        product_id: id,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        user_name: newReview.user_name || "Anonymous",
      });

      if (error) throw error;

      toast.success("Review submitted successfully!");
      setShowReviewForm(false);
      setNewReview({ rating: 0, title: "", comment: "", user_name: "" });
      refetch(); // Refresh reviews
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };

  const { data: product, isLoading: loading, refetch } = useQuery<Product | null>({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await getProductById(id);
      return data;
    },
  });

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      if (!id) return [];
      const { data } = await getProductReviews(id);
      return data || [];
    },
    enabled: !!id,
  });

  // Effective sizes/colors with fallbacks
  const availableSizes = product?.sizes && product.sizes.length > 0 ? product.sizes : DEFAULT_SIZES;
  const availableColors = product?.colors && product.colors.length > 0 ? product.colors : DEFAULT_COLORS;

  useEffect(() => {
    if (product) {
      if (!selectedColor && availableColors.length > 0) {
        setSelectedColor(availableColors[0]);
      }
      if (!selectedSize && availableSizes.length > 0) {
        setSelectedSize(availableSizes[0]);
      }
    }
  }, [product, selectedColor, selectedSize, availableColors, availableSizes]);

  useEffect(() => {
    if (!id) return;

    // Subscribe to Product changes
    const productSub = supabase
      .channel(`product:${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products', filter: `id=eq.${id}` },
        () => refetch()
      )
      .subscribe();

    // Subscribe to Review changes
    const reviewSub = supabase
      .channel(`reviews:${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_reviews', filter: `product_id=eq.${id}` },
        () => {
          // Refetch reviews when a new one is added
          refetchReviews(); // We need to extract the reviews query to assign this name or just use queryKey
        }
      )
      .subscribe();

    return () => {
      productSub.unsubscribe();
      reviewSub.unsubscribe();
    };
  }, [id, refetch, refetchReviews]);

  if (loading) {
    return (
      <Layout>
        <div className="container-wide py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-secondary aspect-square rounded-sm animate-pulse" />
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-secondary rounded w-3/4" />
              <div className="h-6 bg-secondary rounded w-1/4" />
              <div className="h-24 bg-secondary rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container-wide py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <button onClick={() => navigate("/shop")} className="btn-primary">
            Back to Shop
          </button>
        </div>
      </Layout>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const salePrice = product.sale_price;
  const discount = salePrice
    ? Math.round(((product.price - salePrice) / product.price) * 100)
    : 0;
  const displayPrice = salePrice || product.price;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.warning("Please select a size and color");
      return;
    }

    addItem(product, quantity, selectedSize, selectedColor);
    toast.success(`${product.name} added to cart`);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      toast.warning("Please select a size and color");
      return;
    }

    addItem(product, quantity, selectedSize, selectedColor);
    navigate("/cart");
  };

  const handleWishlist = () => {
    if (!product) return;
    if (wishlisted) {
      removeFromWishlist(product.id);
      toast.info("Removed from wishlist");
    } else {
      addToWishlist(product);
      toast.success("Added to wishlist");
    }
  };

  return (
    <Layout>
      {/* Product section */}
      <div className="container-wide py-12">
        <button
          onClick={() => navigate("/shop")}
          className="text-sm text-muted-foreground hover:text-primary transition-colors mb-8 flex items-center gap-1"
        >
          ← Back to Shop
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery */}
          <div>
            {/* Main image */}
            <div className="bg-secondary aspect-square rounded-sm overflow-hidden mb-4 group cursor-zoom-in">
              <img
                src={product.images[selectedImage]?.url}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Thumbnail images */}
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-sm overflow-hidden border-2 transition-colors ${selectedImage === idx ? "border-primary" : "border-border"
                    }`}
                >
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground tracking-wider uppercase mb-2">
                    {product.category?.name}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {product.name}
                  </h1>
                </div>
                <button
                  onClick={handleWishlist}
                  className={`p-2 rounded-sm transition-colors ${wishlisted
                    ? "bg-accent/10 text-accent"
                    : "bg-secondary text-primary hover:bg-secondary/80"
                    }`}
                  aria-label="Add to wishlist"
                >
                  <Heart
                    size={20}
                    className={wishlisted ? "fill-current" : ""}
                  />
                </button>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-primary">
                  ₵{displayPrice.toFixed(2)}
                </span>
                {salePrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      ₵{product.price.toFixed(2)}
                    </span>
                    <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-1">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-primary text-primary"
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({reviews.length} reviews)
                </span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-8">
                {product.description}
              </p>
            </div>

            {/* Size selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 tracking-wider uppercase">
                Size
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-1 md:py-3 md:px-2 rounded-sm border-2 font-medium text-xs md:text-sm transition-colors ${selectedSize === size
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 tracking-wider uppercase">
                Color
              </label>
              <div className="flex gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color
                      ? "border-primary ring-2 ring-primary"
                      : "border-border"
                      }`}
                    style={{ backgroundColor: color || "#ccc" }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Quantity selector */}
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-3 tracking-wider uppercase">
                Quantity
              </label>
              <div className="flex items-center border border-border rounded-sm w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-secondary transition-colors"
                >
                  −
                </button>
                <span className="px-6 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-secondary transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                className={`btn-primary w-full flex items-center justify-center gap-2 h-12 md:h-14 transition-all ${addedToCart ? "bg-green-600" : ""
                  }`}
              >
                <ShoppingBag size={18} />
                {addedToCart ? "Added to Cart!" : "Add to Cart"}
              </button>
              <button onClick={handleBuyNow} className="btn-outline w-full h-12 md:h-14">Buy Now</button>
            </div>

            {/* Info boxes */}
            <div className="space-y-3 border-t border-border pt-8">
              <div className="flex items-start gap-3">
                <Truck
                  size={20}
                  className="text-primary flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">
                    On orders over ₵100
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw
                  size={20}
                  className="text-primary flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">
                    30-day return policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size guide section */}
      <section className="bg-secondary py-12 mt-16">
        <div className="container-wide">
          <h2 className="text-2xl font-bold mb-6">Size Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4">How to Measure</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong className="text-primary">Chest:</strong> Measure
                  around the fullest part of your chest
                </li>
                <li>
                  <strong className="text-primary">Waist:</strong> Measure at
                  your natural waistline
                </li>
                <li>
                  <strong className="text-primary">Length:</strong> Measure from
                  shoulder to hem
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Size Chart</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Size</th>
                    <th className="text-left py-2">XS</th>
                    <th className="text-left py-2">S</th>
                    <th className="text-left py-2">M</th>
                    <th className="text-left py-2">L</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2">Chest</td>
                    <td>32"</td>
                    <td>34"</td>
                    <td>36"</td>
                    <td>38"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews section */}
      <section className="py-12">
        <div className="container-wide">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Customer Reviews</h2>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="relative">
                <select
                  value={reviewSort}
                  onChange={(e) => setReviewSort(e.target.value as any)}
                  className="text-sm bg-secondary/50 hover:bg-secondary border-none rounded-md px-3 py-2 focus:ring-1 focus:ring-primary cursor-pointer font-medium appearance-none pr-8"
                >
                  <option value="newest">Newest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="btn-outline text-sm whitespace-nowrap px-6 py-2 h-10 flex items-center justify-center min-w-[140px]"
              >
                {showReviewForm ? "Cancel Review" : "Write a Review"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Rating Summary Card */}
            <div className="md:col-span-1 bg-secondary/30 p-6 rounded-lg flex flex-col items-center justify-center text-center">
              <div className="text-5xl font-bold mb-2">
                {reviews.length > 0
                  ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
                  : "0.0"}
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < Math.round(reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / (reviews.length || 1))
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/30"
                    }
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground font-medium">Based on {reviews.length} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="md:col-span-3 bg-secondary/10 p-6 rounded-lg space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((r: any) => r.rating === rating).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-4 text-sm">
                    <div className="w-12 font-medium flex items-center gap-1">
                      {rating} <Star size={12} className="fill-primary text-primary" />
                    </div>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-right text-muted-foreground">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="bg-secondary/30 p-6 rounded-lg mb-8 space-y-4 animate-fade-in">
              <h3 className="font-semibold text-lg">Write your review</h3>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${star <= newReview.rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-sm border border-border focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="Summary of your experience"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium mb-2">Review</label>
                <textarea
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-4 py-2 rounded-sm border border-border focus:ring-1 focus:ring-primary focus:outline-none min-h-[100px]"
                  placeholder="Tell us about the product..."
                />
              </div>

              {/* Name (Optional) */}
              <div>
                <label className="block text-sm font-medium mb-2">Name (Optional)</label>
                <input
                  type="text"
                  value={newReview.user_name}
                  onChange={(e) => setNewReview(prev => ({ ...prev, user_name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-sm border border-border focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="Your name"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="text-sm px-4 py-2 hover:bg-black/5 rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-2 text-sm"
                  disabled={newReview.rating === 0}
                >
                  Submit Review
                </button>
              </div>
            </form>
          )}

          <div className="space-y-6">
            {reviews.length > 0 ? (
              [...reviews]
                .sort((a: any, b: any) => {
                  if (reviewSort === "highest") return b.rating - a.rating;
                  if (reviewSort === "lowest") return a.rating - b.rating;
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                })
                .map((review: any) => (
                  <div key={review.id} className="border-b border-border last:border-0 pb-6 animate-fade-in group">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold transition-transform group-hover:scale-110">
                        {(review.user_name || "A").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{review.user_name || "Anonymous"}</h4>
                            <span className="text-xs text-green-600 flex items-center gap-0.5 mt-0.5 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                              Verified Buyer
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 my-2">
                          {[...Array(5)].map((_, j) => (
                            <Star
                              key={j}
                              size={14}
                              className={j < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-200"}
                            />
                          ))}
                          <span className="text-xs font-semibold ml-2">{review.title}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-12 bg-secondary/30 rounded-lg">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary mb-4">
                  <Star className="h-6 w-6 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-lg font-semibold">No reviews yet</h3>
                <p className="text-muted-foreground">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
