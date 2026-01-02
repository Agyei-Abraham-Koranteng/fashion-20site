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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-accent/20 p-8 rounded-xl text-center border border-accent/30 backdrop-blur-sm"
            >
                <div className="relative inline-block mb-4">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full"
                    />
                    <Star className="w-16 h-16 text-yellow-400 fill-yellow-400 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold text-primary-foreground mb-3">You're Amazing!</h3>
                <p className="text-primary-foreground/80 leading-relaxed">
                    Your feedback means the world to us. It's how we keep making this experience better for everyone.
                </p>
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-xs text-primary-foreground/50 hover:text-primary-foreground underline underline-offset-4"
                >
                    Submit another feedback
                </motion.button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-3 text-white">
                Rate Your Experience
            </h3>
            <p className="text-sm text-slate-300 mb-4">
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
                                    : "text-slate-600"
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
                        className="w-full min-h-[80px] rounded-md bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-slate-500 focus:bg-slate-750 p-3 text-sm resize-none transition-all focus:outline-none focus:ring-1 focus:ring-slate-500"
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
