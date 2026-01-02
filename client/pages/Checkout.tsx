import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createOrder } from "@/lib/api";
import { ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [billingInfo, setBillingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [reservationInfo, setReservationInfo] = useState({
    note: "",
  });

  const [sameAsBilling, setSameAsBilling] = useState(true);

  if (items.length === 0 && !orderPlaced) {
    return (
      <Layout>
        <div className="container-wide py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Add items to your cart before checking out.
          </p>
          <button onClick={() => navigate("/shop")} className="btn-primary">
            Return to Shop
          </button>
        </div>
      </Layout>
    );
  }

  const handlePlaceOrder = async () => {
    if (!shippingInfo.firstName || !shippingInfo.address) {
      toast.error("Please fill in all required shipping fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to place an order");
      navigate("/login?redirect=/checkout");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        items: items.map(item => ({
          product_id: Number(item.product.id),
          quantity: item.quantity,
          price: (item.product.sale_price || item.product.price),
          size: item.size,
          color: item.color
        })),
        shipping_address: shippingInfo,
        billing_address: sameAsBilling ? shippingInfo : billingInfo,
        notes: reservationInfo.note
      };

      const { error } = await createOrder(user.id, orderData);

      if (error) {
        throw error;
      }

      setOrderPlaced(true);
      clearCart();
      toast.success("Reservation placed successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <Layout>
        <div className="container-wide py-20">
          <div className="text-center max-w-md mx-auto">
            <CheckCircle size={64} className="text-accent mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Reservation Confirmed!</h1>
            <p className="text-muted-foreground mb-2">
              Thank you for reserving your items.
            </p>
            <p className="text-muted-foreground mb-8">
              Order #12345 | You will receive an email confirmation shortly with further instructions.
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-left text-sm text-blue-800">
              <p className="font-semibold mb-1">Next Steps:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>We will review your reservation request.</li>
                <li>Our team will contact you to confirm availability and discuss payment options.</li>
                <li>Once confirmed, we will ship your items!</li>
              </ol>
            </div>

            <div className="bg-secondary rounded-sm p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4">Order Details</h3>
              <div className="space-y-2 text-sm mb-4">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₵{total.toFixed(2)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{total >= 100 ? "FREE" : "₵10.00"}</span>
                </p>
                <p className="flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Total</span>
                  <span>
                    ₵
                    {(
                      total +
                      (total >= 100 ? 0 : 10) +
                      (total >= 100 ? total : total + 10) * 0.08
                    ).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/shop")}
                className="btn-secondary flex-1"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate("/")}
                className="btn-primary flex-1"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-wide py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout form */}
          <div className="lg:col-span-2">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-12">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${s <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                      }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${s < step ? "bg-primary" : "bg-secondary"
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Shipping */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="First Name*"
                    value={shippingInfo.firstName}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        firstName: e.target.value,
                      })
                    }
                    className="px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Last Name*"
                    value={shippingInfo.lastName}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        lastName: e.target.value,
                      })
                    }
                    className="px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="email"
                    placeholder="Email*"
                    value={shippingInfo.email}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        email: e.target.value,
                      })
                    }
                    className="px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary md:col-span-2"
                  />
                  <input
                    type="tel"
                    placeholder="Phone*"
                    value={shippingInfo.phone}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        phone: e.target.value,
                      })
                    }
                    className="px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Street Address*"
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        address: e.target.value,
                      })
                    }
                    className="px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="City*"
                    value={shippingInfo.city}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, city: e.target.value })
                    }
                    className="px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="State/Province*"
                    value={shippingInfo.state}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        state: e.target.value,
                      })
                    }
                    className="px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Zip Code*"
                    value={shippingInfo.zipCode}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        zipCode: e.target.value,
                      })
                    }
                    className="px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Country*"
                    value={shippingInfo.country}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        country: e.target.value,
                      })
                    }
                    className="px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto sm:ml-auto h-12 md:h-14"
                >
                  Continue to Billing
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Step 2: Billing */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Billing Address</h2>

                <div className="mb-6">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={(e) => setSameAsBilling(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">
                      Same as shipping address
                    </span>
                  </label>
                </div>

                {!sameAsBilling && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <input
                      type="text"
                      placeholder="First Name*"
                      value={billingInfo.firstName}
                      onChange={(e) =>
                        setBillingInfo({
                          ...billingInfo,
                          firstName: e.target.value,
                        })
                      }
                      className="px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="Last Name*"
                      value={billingInfo.lastName}
                      onChange={(e) =>
                        setBillingInfo({
                          ...billingInfo,
                          lastName: e.target.value,
                        })
                      }
                      className="px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="Street Address*"
                      value={billingInfo.address}
                      onChange={(e) =>
                        setBillingInfo({
                          ...billingInfo,
                          address: e.target.value,
                        })
                      }
                      className="px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary md:col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="City*"
                      value={billingInfo.city}
                      onChange={(e) =>
                        setBillingInfo({ ...billingInfo, city: e.target.value })
                      }
                      className="px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="State/Province*"
                      value={billingInfo.state}
                      onChange={(e) =>
                        setBillingInfo({
                          ...billingInfo,
                          state: e.target.value,
                        })
                      }
                      className="px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-secondary w-full h-12 md:h-14"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="btn-primary w-full flex items-center justify-center gap-2 h-12 md:h-14"
                  >
                    Continue to Confirmation
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Reservation Confirmation */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Confirm Reservation</h2>
                <div className="bg-secondary/50 p-6 rounded-lg mb-6">
                  <h3 className="font-semibold mb-4">Reservation Details</h3>
                  <p className="text-muted-foreground mb-4">
                    Please note that this is a <strong>reservation only</strong>. No payment is required at this stage.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    By clicking "Reserve Order", you are placing a hold on these items. We will contact you shortly via email or phone to arrange payment and delivery.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Add a Note (Optional)</label>
                      <textarea
                        className="w-full min-h-[100px] px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                        placeholder="Special instructions or questions..."
                        value={reservationInfo.note}
                        onChange={(e) => setReservationInfo({ ...reservationInfo, note: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="btn-secondary w-full h-12 md:h-14"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed h-12 md:h-14"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>
                        Reserve Order
                        <CheckCircle size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-secondary rounded-sm p-6 sticky top-20">
              <h3 className="text-lg font-bold mb-6">Order Summary</h3>

              <div className="space-y-3 mb-6 pb-6 border-b border-border max-h-96 overflow-y-auto">
                {items.map((item, idx) => (
                  <div
                    key={`${item.product_id}-${item.size}-${item.color}-${idx}`}
                    className="text-sm"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">
                        {item.product.name}
                      </span>
                      <span className="font-medium">x{item.quantity}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ₵
                      {(
                        (item.product.sale_price || item.product.price) *
                        item.quantity
                      ).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₵{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{total >= 100 ? "FREE" : "₵10.00"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>
                    ₵{((total >= 100 ? total : total + 10) * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold">
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
