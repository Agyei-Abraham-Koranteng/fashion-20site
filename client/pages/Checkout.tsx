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

  const validateShipping = () => {
    const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "state", "zipCode", "country"];
    const emptyFields = requiredFields.filter(field => !shippingInfo[field as keyof typeof shippingInfo]);

    if (emptyFields.length > 0) {
      toast.error("Please fill in all required shipping fields");
      return false;
    }
    return true;
  };

  const validateBilling = () => {
    if (sameAsBilling) return true;

    const requiredFields = ["firstName", "lastName", "address", "city", "state", "zipCode", "country"];
    const emptyFields = requiredFields.filter(field => !billingInfo[field as keyof typeof billingInfo]);

    if (emptyFields.length > 0) {
      toast.error("Please fill in all required billing fields");
      return false;
    }
    return true;
  };

  const validateShipping = () => {
    const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "state", "zipCode", "country"];
    const emptyFields = requiredFields.filter(field => !shippingInfo[field as keyof typeof shippingInfo]);

    if (emptyFields.length > 0) {
      toast.error("Please fill in all required shipping fields");
      return false;
    }
    return true;
  };

  const validateBilling = () => {
    if (sameAsBilling) return true;

    const requiredFields = ["firstName", "lastName", "address", "city", "state", "zipCode", "country"];
    const emptyFields = requiredFields.filter(field => !billingInfo[field as keyof typeof billingInfo]);

    if (emptyFields.length > 0) {
      toast.error("Please fill in all required billing fields");
      return false;
    }
    return true;
  };

  const handleValidationPlaceOrder = async () => {
    if (!validateShipping() || !validateBilling()) return;
    handlePlaceOrder();
  };

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
    // Basic validation already done by step transitions, but verify final state
    if (!validateShipping() || !validateBilling()) return;

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
              </div >
            )
}

{/* Step 3: Reservation Confirmation */ }
{
  step === 3 && (
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
  )
}
          </div >

  {/* Order summary */ }
  < div className = "lg:col-span-1" >
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
          </div >
        </div >
      </div >
    </Layout >
  );
}
