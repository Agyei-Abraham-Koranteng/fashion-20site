import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock, Loader2, ArrowRight, Check, X, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResetPassword() {
    const { user, updatePassword, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // If loading, wait
        if (loading) return;

        // If no user session, they shouldn't be here (recovery link sets a session automatically)
        if (!user) {
            toast.error("Invalid or expired reset session. Please request a new link.");
            navigate("/forgot-password");
        }
    }, [user, loading, navigate]);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const getPasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length >= 6) strength++;
        if (pass.length >= 8) strength++;
        if (/[A-Z]/.test(pass)) strength++;
        if (/[0-9]/.test(pass)) strength++;
        if (/[^A-Za-z0-9]/.test(pass)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(password);
    const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

    const passwordRequirements = [
        { label: "At least 6 characters", met: password.length >= 6 },
        { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
        { label: "Contains number", met: /[0-9]/.test(password) },
        { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
    ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await updatePassword(password);
            setSuccess(true);
            toast.success("Password updated successfully!");
            setTimeout(() => navigate("/login"), 3000);
        } catch (err: any) {
            toast.error(err.message || "Failed to update password");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-100 via-white to-gray-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-gray-100"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
                    >
                        <Check className="w-10 h-10 text-green-600" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3 font-serif">Password Updated!</h2>
                    <p className="text-gray-500 mb-8 font-medium">
                        Your account security has been restored. Redirecting you to login...
                    </p>
                    <Link to="/login">
                        <Button className="w-full h-12 bg-gray-900 hover:bg-black font-bold rounded-xl transition-all shadow-lg shadow-gray-900/10">
                            Sign in now
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-100 via-white to-gray-50 flex flex-col items-center justify-center p-6 sm:p-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Link to="/" className="text-3xl font-serif font-bold tracking-tight text-gray-900 hover:opacity-80 transition-opacity">
                    MadeInFashion
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[480px] bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
            >
                <div className="p-8 sm:p-12">
                    <div className="mb-10">
                        <h2 className="text-4xl font-serif font-bold text-gray-900 mb-3 tracking-tight">New Password</h2>
                        <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">Secure your account with a strong password</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                New Password
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors({ ...errors, password: "" });
                                    }}
                                    placeholder="••••••••"
                                    className={cn("pl-10 h-13 bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:ring-0 focus:border-gray-900 transition-all rounded-2xl", errors.password && "border-red-500 ring-red-100")}
                                />
                            </div>

                            <AnimatePresence>
                                {password && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3 pt-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 mt-2"
                                    >
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "h-1.5 flex-1 rounded-full transition-all duration-500",
                                                        i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-200"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <p className={cn("text-[10px] font-bold uppercase tracking-widest", passwordStrength >= 4 ? "text-green-600" : "text-gray-400 text-center")}>
                                            Strength: {strengthLabels[passwordStrength - 1] || "None"}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-tight">
                                            {passwordRequirements.map((req) => (
                                                <div key={req.label} className={cn("flex items-center gap-1.5 transition-colors", req.met ? "text-green-600" : "text-gray-300")}>
                                                    {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-gray-200" />}
                                                    {req.label}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {errors.password && <p className="text-xs text-red-500 mt-1 font-medium">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                Confirm New Password
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                                    }}
                                    placeholder="••••••••"
                                    className={cn("pl-10 h-13 bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:ring-0 focus:border-gray-900 transition-all rounded-2xl", errors.confirmPassword && "border-red-500 ring-red-100")}
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 font-medium">{errors.confirmPassword}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-13 text-sm font-bold bg-gray-900 hover:bg-black text-white rounded-2xl transition-all relative overflow-hidden group active:scale-[0.98] shadow-xl shadow-gray-900/10"
                            disabled={isSubmitting}
                        >
                            <AnimatePresence mode="wait">
                                {isSubmitting ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex justify-center"
                                    >
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="content"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        Update Password <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Button>
                    </form>
                </div>

                <div className="bg-gray-50/50 p-6 border-t border-gray-100 flex items-center justify-center gap-2">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
                        The Premium Fashion Experience
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
