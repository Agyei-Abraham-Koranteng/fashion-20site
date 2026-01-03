import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, ShieldCheck, Sparkles, ChevronLeft } from "lucide-react";

export default function Login() {
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
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      const redirectParam = params.get("redirect");
      if (redirectParam && redirectParam !== "/login") {
        navigate(decodeURIComponent(redirectParam), { replace: true });
      } else if (user.role === "admin" && !params.get("redirect")) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, authLoading, navigate, params]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-100 via-white to-gray-50 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 p-3 bg-white/40 backdrop-blur-md border border-white/40 rounded-full shadow-lg shadow-gray-200/20 hover:bg-white/60 transition-all group active:scale-95 z-50"
        title="Go Back"
      >
        <ChevronLeft className="h-5 w-5 text-gray-900 group-hover:-translate-x-0.5 transition-transform" />
      </motion.button>

      {/* Brand Logo - Minimalist */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link to="/" className="text-2xl font-serif font-semibold tracking-tighter text-gray-900 hover:opacity-70 transition-opacity">
          MadeInFashion
        </Link>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100/50 overflow-hidden"
      >
        <div className="p-10 sm:p-12">
          <div className="mb-10">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-400 text-sm">Welcome back to your fashion space</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="you@example.com"
                  className={`pl-10 h-13 bg-gray-50/50 border-gray-100/80 focus:bg-white focus:ring-1 focus:ring-gray-900/5 focus:border-gray-900 transition-all rounded-2xl ${errors.email ? "border-red-500 ring-red-100" : ""}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Password
                </Label>
                <Link to="/forgot-password" title="Recover account" className="text-xs font-bold text-gray-900 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 h-13 bg-gray-50/50 border-gray-100/80 focus:bg-white focus:ring-1 focus:ring-gray-900/5 focus:border-gray-900 transition-all rounded-2xl ${errors.password ? "border-red-500 ring-red-100" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors px-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1 font-medium">{errors.password}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-gray-300 rounded-sm"
              />
              <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer select-none">
                Stay signed in
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-13 text-sm font-semibold bg-gray-900 hover:bg-black text-white rounded-2xl shadow-lg shadow-gray-900/10 transition-all relative overflow-hidden group active:scale-[0.99]"
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
                    Sign In <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100/50 text-center">
            <p className="text-sm text-gray-400 font-medium">
              New to MadeInFashion?{" "}
              <Link to="/signup" className="text-gray-900 font-bold hover:underline transition-all">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info in card */}
        <div className="bg-gray-50/50 p-6 border-t border-gray-100 flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
            The Premium Fashion Experience
          </p>
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
      <Link to="/admin/login" className="mt-4 text-[10px] text-gray-300 hover:text-gray-500 transition-colors uppercase tracking-widest font-bold">
        Admin Access
      </Link>
    </div>
  );
}
