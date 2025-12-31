import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock, User, ArrowRight, Check, X, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignUp() {
    const { register, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

    const passwordRequirements = [
        { label: "At least 6 characters", met: formData.password.length >= 6 },
        { label: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
        { label: "Contains number", met: /[0-9]/.test(formData.password) },
        { label: "Contains special character", met: /[^A-Za-z0-9]/.test(formData.password) },
    ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!agreedToTerms) {
            newErrors.terms = "You must agree to the terms";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await register(formData.email.trim().toLowerCase(), formData.password, formData.fullName.trim());
            setSuccess(true);
        } catch (err: any) {
            toast.error(err.message || "Registration failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (user) {
            navigate("/", { replace: true });
        }
    }, [user, authLoading, navigate]);

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center border border-gray-100"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <Check className="w-10 h-10 text-green-600" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 font-serif">Account Created!</h2>
                    <p className="text-gray-500 mb-8">
                        Welcome to MadeInFashion. Your exclusive style journey begins now.
                    </p>
                    <Link to="/login">
                        <Button className="w-full h-12 bg-gray-900 hover:bg-black font-bold rounded-xl transition-all">
                            Sign in to your account
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 sm:p-12">
            {/* Brand Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Link to="/" className="text-3xl font-serif font-bold tracking-tight text-gray-900 hover:opacity-80 transition-opacity">
                    MadeInFashion
                </Link>
            </motion.div>

            {/* Signup Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[500px] bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
            >
                <div className="p-8 sm:p-10">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-500 text-sm">Join the elite fashion community</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                Full Name
                            </Label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                <Input
                                    id="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    placeholder="John Doe"
                                    className={cn("pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all", errors.fullName && "border-red-500 ring-red-100")}
                                />
                            </div>
                            {errors.fullName && <p className="text-xs text-red-500 mt-1 font-medium">{errors.fullName}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                Email Address
                            </Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="you@example.com"
                                    className={cn("pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all", errors.email && "border-red-500 ring-red-100")}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                Password
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    placeholder="••••••••"
                                    className={cn("pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all", errors.password && "border-red-500 ring-red-100")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors px-1"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {formData.password && (
                                <div className="space-y-3 mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-1.5 flex-1 rounded-full transition-colors",
                                                    i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-200"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <p className={cn("text-[10px] font-bold uppercase tracking-widest", passwordStrength >= 4 ? "text-green-600" : "text-gray-400")}>
                                        Strength: {strengthLabels[passwordStrength - 1] || "None"}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-tight">
                                        {passwordRequirements.map((req) => (
                                            <div key={req.label} className={cn("flex items-center gap-1.5", req.met ? "text-green-600" : "text-gray-400")}>
                                                {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                {req.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {errors.password && <p className="text-xs text-red-500 mt-1 font-medium">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                Confirm Password
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                    placeholder="••••••••"
                                    className={cn("pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all", errors.confirmPassword && "border-red-500 ring-red-100")}
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 font-medium">{errors.confirmPassword}</p>}
                        </div>

                        <div className="flex items-start space-x-2 pt-2">
                            <Checkbox
                                id="terms"
                                checked={agreedToTerms}
                                onCheckedChange={(checked) => {
                                    setAgreedToTerms(checked as boolean);
                                    if (errors.terms) setErrors({ ...errors, terms: "" });
                                }}
                                className="mt-0.5 border-gray-300 rounded-sm"
                            />
                            <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer leading-relaxed">
                                I agree to the <Link to="/terms" className="text-gray-900 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-gray-900 font-bold hover:underline">Privacy Policy</Link>
                            </label>
                        </div>
                        {errors.terms && <p className="text-xs text-red-500 mt-1 font-medium text-center">{errors.terms}</p>}

                        <Button
                            type="submit"
                            className="w-full h-12 text-sm font-bold bg-gray-900 hover:bg-black text-white rounded-xl transition-all active:scale-[0.98] mt-4"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{" "}
                            <Link to="/login" className="font-bold text-gray-900 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer info in card */}
                <div className="bg-gray-50 p-6 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3" />
                    Secure Member Registration
                </div>
            </motion.div>

            {/* Bottom Legal Links */}
            <div className="mt-12 flex gap-6 text-xs text-gray-400">
                <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms of Use</Link>
                <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy Notice</Link>
                <Link to="/faq" className="hover:text-gray-900 transition-colors">Help</Link>
            </div>
            <p className="mt-4 text-[10px] text-gray-300 uppercase tracking-widest font-bold">
                © 2025 MadeInFashion. All Rights Reserved.
            </p>
        </div>
    );
}
