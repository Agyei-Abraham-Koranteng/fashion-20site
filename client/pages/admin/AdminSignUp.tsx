import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Check, X, ShieldCheck, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSignUp() {
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
            newErrors.terms = "Agreement required for access";
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
            toast.success("Administrator account request submitted");
        } catch (err: any) {
            toast.error(err.message || "Registration failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (user) {
            navigate("/admin", { replace: true });
        }
    }, [user, authLoading, navigate]);

    if (success) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900 rounded-2xl shadow-2xl p-10 max-w-md w-full text-center border border-slate-800"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/20"
                    >
                        <Check className="w-10 h-10 text-indigo-400" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Access Granted</h2>
                    <p className="text-slate-400 mb-8">
                        Your administrator profile has been initialized. You can now access the management console.
                    </p>
                    <Link to="/admin/login">
                        <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl transition-all">
                            Enter Admin Panel
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-12">
            {/* Admin Brand Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col items-center gap-2"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                        <Settings className="h-6 w-6 text-white" />
                    </div>
                    <Link to="/" className="text-2xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
                        MadeInFashion <span className="text-indigo-500 ml-1">ADMIN</span>
                    </Link>
                </div>
            </motion.div>

            {/* Signup Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[500px] bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden"
            >
                <div className="p-8 sm:p-10">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">System Registry</h2>
                        <p className="text-slate-400 text-sm">Create new administrator credentials</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Full Name
                            </Label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    id="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    placeholder="Admin Name"
                                    className={cn("pl-10 h-11 bg-slate-950/50 border-slate-800 text-white placeholder-slate-600 focus:bg-slate-950 focus:border-indigo-500 transition-all", errors.fullName && "border-red-500 ring-red-100")}
                                />
                            </div>
                            {errors.fullName && <p className="text-xs text-red-400 mt-1 font-medium">{errors.fullName}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Official Email
                            </Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="admin@madeinfashion.com"
                                    className={cn("pl-10 h-11 bg-slate-950/50 border-slate-800 text-white placeholder-slate-600 focus:bg-slate-950 focus:border-indigo-500 transition-all", errors.email && "border-red-500 ring-red-100")}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-400 mt-1 font-medium">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                System Password
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    placeholder="••••••••"
                                    className={cn("pl-10 pr-10 h-11 bg-slate-950/50 border-slate-800 text-white placeholder-slate-600 focus:bg-slate-950 focus:border-indigo-500 transition-all", errors.password && "border-red-500 ring-red-100")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors px-1"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {formData.password && (
                                <div className="space-y-3 mt-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-1.5 flex-1 rounded-full transition-colors",
                                                    i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-slate-800"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-tight">
                                        {passwordRequirements.map((req) => (
                                            <div key={req.label} className={cn("flex items-center gap-1.5", req.met ? "text-green-500" : "text-slate-600")}>
                                                {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                {req.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {errors.password && <p className="text-xs text-red-400 mt-1 font-medium">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Verify Password
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                    placeholder="••••••••"
                                    className={cn("pl-10 h-11 bg-slate-950/50 border-slate-800 text-white placeholder-slate-600 focus:bg-slate-950 focus:border-indigo-500 transition-all", errors.confirmPassword && "border-red-500 ring-red-100")}
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-400 mt-1 font-medium">{errors.confirmPassword}</p>}
                        </div>

                        <div className="flex items-start space-x-2 pt-2">
                            <Checkbox
                                id="terms"
                                checked={agreedToTerms}
                                onCheckedChange={(checked) => {
                                    setAgreedToTerms(checked as boolean);
                                    if (errors.terms) setErrors({ ...errors, terms: "" });
                                }}
                                className="mt-0.5 border-slate-700 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                            <label htmlFor="terms" className="text-xs text-slate-400 cursor-pointer leading-relaxed">
                                I confirm I am authorized to access the <span className="text-white font-bold">Admin Management Console</span> and will adhere to system protocols.
                            </label>
                        </div>
                        {errors.terms && <p className="text-xs text-red-400 mt-1 font-medium text-center">{errors.terms}</p>}

                        <Button
                            type="submit"
                            className="w-full h-12 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-[0.98] mt-4"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Initialize Admin Profile"}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                        <p className="text-sm text-slate-400">
                            Already registered?{" "}
                            <Link to="/admin/login" className="font-bold text-white hover:text-indigo-400 hover:underline transition-colors">
                                Admin Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer info in card */}
                <div className="bg-slate-950/50 p-6 border-t border-slate-800 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3 text-indigo-500" />
                    Secure Member Registration
                </div>
            </motion.div>

            {/* Bottom Legal Links */}
            <div className="mt-8 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                Authorized Access Only • MadeInFashion Management Console
            </div>
        </div>
    );
}
