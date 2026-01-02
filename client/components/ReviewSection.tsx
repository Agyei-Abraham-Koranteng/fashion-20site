import { addSystemFeedback } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { Star, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function ReviewSection() {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating star");
            return;
        }

        try {
            const { error } = await addSystemFeedback({
                rating,
                feedback
            });

            if (error) throw error;

            setSubmitted(true);
            toast.success("Thank you for your feedback!");
        } catch (error: any) {
            console.error("Feedback error:", error);
            toast.error(`Failed: ${error.message || error.details || "Unknown error"}`);
        }
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary-foreground/10 p-6 rounded-lg text-center"
            >
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4 fill-yellow-500" />
                <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                <p className="text-primary-foreground/80">Your feedback helps us improve.</p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-3 text-primary-foreground">
                Rate Your Experience
            </h3>
            <p className="text-sm text-primary-foreground/70 mb-4">
                Help us improve the system with your valuable feedback.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Stars */}
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star
                                className={`w-6 h-6 transition-colors ${star <= (hoverRating || rating)
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-primary-foreground/30"
                                    }`}
                            />
                        </button>
                    ))}
                </div>

                {/* Feedback Text */}
                <div className="relative">
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tell us what you think..."
                        className="w-full min-h-[80px] rounded-md bg-primary-foreground/10 border-transparent focus:border-primary-foreground/30 focus:bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 p-3 text-sm resize-none transition-all focus:outline-none focus:ring-1 focus:ring-primary-foreground/30"
                    />
                </div>

                <Button
                    type="submit"
                    size="sm"
                    className="w-full bg-white text-black hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
                >
                    <span>Submit Review</span>
                    <Send className="w-3 h-3" />
                </Button>
            </form>
        </div>
    );
}
