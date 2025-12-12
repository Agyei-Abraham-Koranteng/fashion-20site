import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { getProductById } from "@/lib/api";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, ShoppingBag, Truck, RotateCcw, Star } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem } = useCart();
  const {
    isWishlisted,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
  } = useWishlist();

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      const { data } = await getProductById(id);
      setProduct(data || null);
      if (data) {
        setSelectedColor(data.colors?.[0] || "");
        setSelectedSize(data.sizes?.[0] || "");
      }
      setLoading(false);
    }

    loadProduct();
  }, [id]);

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
      alert("Please select a size and color");
      return;
    }

    addItem(product, quantity, selectedSize, selectedColor);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = () => {
    if (wishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
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
            <div className="bg-secondary aspect-square rounded-sm overflow-hidden mb-4">
              <img
                src={product.images[selectedImage]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail images */}
            <div className="flex gap-3">
              {product.images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-sm overflow-hidden border-2 transition-colors ${
                    selectedImage === idx ? "border-primary" : "border-border"
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
                  className={`p-2 rounded-sm transition-colors ${
                    wishlisted
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
                  ${displayPrice.toFixed(2)}
                </span>
                {salePrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-1">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-primary text-primary"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  (127 reviews)
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
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 px-2 rounded-sm border-2 font-medium text-sm transition-colors ${
                      selectedSize === size
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
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color
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
                className={`btn-primary flex items-center justify-center gap-2 transition-all ${
                  addedToCart ? "bg-green-600" : ""
                }`}
              >
                <ShoppingBag size={18} />
                {addedToCart ? "Added to Cart!" : "Add to Cart"}
              </button>
              <button className="btn-outline">Buy Now</button>
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
                    On orders over $100
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
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-border pb-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">Great Quality!</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            size={14}
                            className="fill-primary text-primary"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        by Customer
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Love this product! Excellent quality and fast shipping. Highly
                  recommend.
                </p>
                <p className="text-xs text-muted-foreground">2 weeks ago</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
