import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Loader2, ArrowLeft, Check } from "lucide-react";

export default function ForgotPassword() {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const validateEmail = () => {
        if (!email) {
            setError("Email is required");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email");
            return false;
        }
        return true;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateEmail()) return;

        setIsSubmitting(true);
        try {
            await resetPassword(email.trim().toLowerCase());
            setSuccess(true);
        } catch (err: any) {
            toast.error(err.message || "Failed to send reset email");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <Mail className="w-10 h-10 text-blue-600" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h2>
                    <p className="text-gray-600 mb-6">
                        We've sent a password reset link to{" "}
                        <span className="font-semibold text-gray-900">{email}</span>
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                        Click the link in the email to reset your password. If you don't see it, check your spam folder.
                    </p>
                    <div className="space-y-3">
                        <Link to="/login">
                            <Button className="w-full h-12 bg-gray-900 hover:bg-gray-800">
                                Back to Sign In
                            </Button>
                        </Link>
                        <button
                            onClick={() => setSuccess(false)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Didn't receive the email? Try again
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl p-8 md:p-10 max-w-md w-full"
            >
                {/* Back Link */}
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                </Link>

                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Forgot your password?</h2>
                    <p className="text-gray-600">
                        No worries! Enter your email and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email Address
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError("");
                                }}
                                placeholder="you@example.com"
                                className={`pl-10 h-12 ${error ? "border-red-500" : ""}`}
                            />
                        </div>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-500"
                            >
                                {error}
                            </motion.p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-gray-900 hover:bg-gray-800"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </Button>
                </form>

                <p className="mt-8 text-center text-gray-600 text-sm">
                    Remember your password?{" "}
                    <Link to="/login" className="font-semibold text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
