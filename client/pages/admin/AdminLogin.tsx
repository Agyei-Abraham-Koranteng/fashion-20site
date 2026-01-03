import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck, Settings, ArrowRight } from "lucide-react";

export default function AdminLogin() {
    const { login, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await login(email.trim().toLowerCase(), password);
            toast.success("Welcome, Administrator");
        } catch (err: any) {
            toast.error(err.message || "Invalid administrator credentials");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (user) {
            const redirectParam = params.get("redirect");
            if (redirectParam && redirectParam !== "/admin/login") {
                navigate(decodeURIComponent(redirectParam), { replace: true });
            } else {
                navigate("/admin", { replace: true });
            }
        }
    }, [user, authLoading, navigate, params]);

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

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[450px] bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden"
            >
                <div className="p-8 sm:p-10">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-serif font-bold text-white mb-2 tracking-tight">System Login</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Administrator Access Required</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Admin Email
                            </Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors({ ...errors, email: undefined });
                                    }}
                                    placeholder="admin@madeinfashion.com"
                                    className={`pl-10 h-12 bg-slate-950 border-slate-800 text-white placeholder-slate-700 focus:bg-slate-950 focus:border-indigo-500 focus:ring-0 transition-all rounded-xl ${errors.email ? "border-red-500 ring-red-100" : ""}`}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-400 mt-1 font-medium">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Password
                                </Label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors({ ...errors, password: undefined });
                                    }}
                                    placeholder="••••••••"
                                    className={`pl-10 pr-10 h-12 bg-slate-950 border-slate-800 text-white placeholder-slate-700 focus:bg-slate-950 focus:border-indigo-500 focus:ring-0 transition-all rounded-xl ${errors.password ? "border-red-500 ring-red-100" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors px-1"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-400 mt-1 font-medium">{errors.password}</p>}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={rememberMe}
                                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                className="border-slate-700 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                            <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer select-none">
                                Maintain secure session
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-[0.98]"
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
                                        Access System <ArrowRight className="h-4 w-4" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-800 text-center">
                        <p className="text-sm text-slate-400">
                            Need admin credentials?{" "}
                            <Link to="/admin/signup" className="font-bold text-white hover:text-indigo-400 hover:underline transition-colors">
                                Register as Admin
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer info in card */}
                <div className="bg-slate-950/50 p-6 border-t border-slate-800 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3 text-indigo-500" />
                    Encrypted Administrator Gateway
                </div>
            </motion.div>

            {/* Bottom info */}
            <p className="mt-8 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                Authorized Access Only • MadeInFashion Management Console
            </p>
        </div>
    );
}
