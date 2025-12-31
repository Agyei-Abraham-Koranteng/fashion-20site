import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock, User, ArrowRight, Check, X } from "lucide-react";
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

    // Password strength check
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

    // Redirect if already logged in
    useEffect(() => {
        if (authLoading) return;
        if (user) {
            navigate("/", { replace: true });
        }
    }, [user, authLoading, navigate]);

    // Success state
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
                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <Check className="w-10 h-10 text-green-600" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Account Created!</h2>
                    <p className="text-gray-600 mb-6">
                        Welcome to MadeInFashion! Your account has been created successfully.
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                        You can now sign in with your email and password.
                    </p>
                    <Link to="/login">
                        <Button className="w-full h-12 bg-gray-900 hover:bg-gray-800">
                            Back to Sign In
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Image/Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />

                <div className="relative z-10 flex flex-col justify-center p-12 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <h2 className="text-4xl font-bold mb-4">
                            Join Our Community
                        </h2>
                        <p className="text-lg text-white/80 max-w-md mb-8">
                            Create an account to unlock exclusive benefits, track your orders, and stay updated with the latest collections.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Exclusive member discounts",
                                "Early access to new arrivals",
                                "Order tracking & history",
                                "Personalized recommendations",
                            ].map((benefit, i) => (
                                <motion.div
                                    key={benefit}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <span>{benefit}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 bg-white overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Logo/Brand */}
                    <Link to="/" className="inline-block mb-6">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">MadeInFashion</h1>
                    </Link>

                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
                        <p className="text-gray-600">Start your fashion journey today</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                                Full Name
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    id="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    placeholder="John Doe"
                                    className={cn("pl-10 h-11", errors.fullName && "border-red-500")}
                                />
                            </div>
                            {errors.fullName && (
                                <p className="text-sm text-red-500">{errors.fullName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="you@example.com"
                                    className={cn("pl-10 h-11", errors.email && "border-red-500")}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    placeholder="••••••••"
                                    className={cn("pl-10 pr-10 h-11", errors.password && "border-red-500")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {/* Password Strength */}
                            {formData.password && (
                                <div className="space-y-2 mt-2">
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
                                    <p className={cn("text-xs", passwordStrength >= 4 ? "text-green-600" : "text-gray-500")}>
                                        {strengthLabels[passwordStrength - 1] || "Enter password"}
                                    </p>

                                    <div className="grid grid-cols-2 gap-1 text-xs">
                                        {passwordRequirements.map((req) => (
                                            <div key={req.label} className={cn("flex items-center gap-1", req.met ? "text-green-600" : "text-gray-400")}>
                                                {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                {req.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                    placeholder="••••••••"
                                    className={cn("pl-10 h-11", errors.confirmPassword && "border-red-500")}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Terms */}
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="terms"
                                checked={agreedToTerms}
                                onCheckedChange={(checked) => {
                                    setAgreedToTerms(checked as boolean);
                                    if (errors.terms) setErrors({ ...errors, terms: "" });
                                }}
                                className="mt-1"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                                I agree to the{" "}
                                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                                {" "}and{" "}
                                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                            </label>
                        </div>
                        {errors.terms && (
                            <p className="text-sm text-red-500">{errors.terms}</p>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-gray-900 hover:bg-gray-800"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-gray-600">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
