import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useCart } from "../context/CartContext";
import { Trash2, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Cart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.info("Please sign in to proceed to checkout");
      navigate("/login?redirect=/checkout");
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-wide py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">🛍️</div>
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Explore our collection and find something you love.
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
          <h1 className="text-3xl md:text-4xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground mt-2">
            You have {items.length} item{items.length !== 1 ? "s" : ""} in your
            cart
          </p>
        </div>
      </section>

      {/* Cart content */}
      <div className="container-wide py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {items.map((item, idx) => (
                <div
                  key={`${item.product_id}-${item.size}-${item.color}-${idx}`}
                  className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-border"
                >
                  {/* Product image and basic info row on mobile */}
                  <div className="flex gap-4 flex-1">
                    <Link
                      to={`/product/${item.product_id}`}
                      className="w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 rounded-sm overflow-hidden bg-secondary hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={
                          item.product.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1505503185646-a42bb3bcb253?w=100&h=100&fit=crop"
                        }
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Product details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <Link
                            to={`/product/${item.product_id}`}
                            className="text-sm font-semibold hover:text-primary transition-colors line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.size} / {item.color}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            removeItem(item.product_id, item.size, item.color);
                            toast.success("Item removed");
                          }}
                          className="p-1 hover:bg-secondary rounded-sm transition-colors flex-shrink-0"
                          aria-label="Remove from cart"
                        >
                          <Trash2 size={16} className="text-destructive/70 hover:text-destructive" />
                        </button>
                      </div>

                      {/* Mobile Price and quantity row */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-border rounded-sm w-fit bg-background">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product_id,
                                item.size,
                                item.color,
                                item.quantity - 1,
                              )
                            }
                            className="px-2 py-1 hover:bg-secondary transition-colors"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 font-medium text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product_id,
                                item.size,
                                item.color,
                                item.quantity + 1,
                              )
                            }
                            className="px-2 py-1 hover:bg-secondary transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          {item.product.sale_price && (
                            <p className="text-[10px] text-muted-foreground line-through">
                              ₵{(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          )}
                          <p className="text-sm font-bold">
                            ₵
                            {(
                              (item.product.sale_price || item.product.price) *
                              item.quantity
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link to="/shop" className="btn-secondary w-full text-center py-4">
                Continue Shopping
              </Link>
              <button onClick={() => {
                clearCart();
                toast.success("Cart cleared");
              }} className="btn-outline w-full py-4">
                Clear Cart
              </button>
            </div>
          </div>

          {/* Cart summary */}
          <div className="lg:col-span-1">
            <div className="bg-secondary rounded-sm p-6 sticky top-20">
              <h3 className="text-lg font-bold mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₵{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {total >= 100 ? "FREE" : "₵10.00"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">
                    ₵{((total >= 100 ? total : total + 10) * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span>
                  ₵
                  {(
                    total +
                    (total >= 100 ? 0 : 10) +
                    (total >= 100 ? total : total + 10) * 0.08
                  ).toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
              >
                Proceed to Checkout
                <ChevronRight size={18} />
              </button>

              <p className="text-xs text-center text-muted-foreground">
                Free shipping on orders over ₵100
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
