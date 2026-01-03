import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialView = "login" }: AuthModalProps) {
    const [view, setView] = useState<"login" | "signup">(initialView);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (view === "login") {
                await login(email, password);
                toast.success("Welcome back!");
                onClose();
            } else {
                await register(email, password, name);
                toast.success("Account created successfully!");
                onClose();
            }
        } catch (error: any) {
            toast.error(error.message || "Authentication failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2.5 bg-gray-50/80 backdrop-blur-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all rounded-full z-20 shadow-sm border border-gray-100 group active:scale-95"
                            >
                                <X size={16} className="transition-transform group-hover:rotate-90" />
                            </button>

                            <div className="px-8 pt-16 pb-8 md:px-10 md:pt-20 md:pb-10">
                                <div className="text-center mb-10">
                                    <motion.div
                                        key={view}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h2 className="text-4xl font-serif font-bold text-gray-900 mb-3 tracking-tight">
                                            {view === "login" ? "Welcome Back" : "Join The Elite"}
                                        </h2>
                                        <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">
                                            {view === "login"
                                                ? "Sign in to your account"
                                                : "Register for exclusive access"}
                                        </p>
                                    </motion.div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {view === "signup" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2"
                                        >
                                            <Label htmlFor="modal-name">Full Name</Label>
                                            <div className="relative group">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                                <Input
                                                    id="modal-name"
                                                    placeholder="John Doe"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="pl-10 h-12 bg-gray-50 border-gray-100 focus:bg-white focus:ring-0 focus:border-gray-900 transition-all rounded-xl"
                                                    required={view === "signup"}
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="modal-email">Email Address</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                            <Input
                                                id="modal-email"
                                                type="email"
                                                placeholder="name@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 h-12 bg-gray-50 border-gray-100 focus:bg-white focus:ring-0 focus:border-gray-900 transition-all rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="modal-password">Password</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                            <Input
                                                id="modal-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 h-12 bg-gray-50 border-gray-100 focus:bg-white focus:ring-0 focus:border-gray-900 transition-all rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {view === "login" && (
                                        <div className="flex justify-end text-sm">
                                            <button type="button" className="text-primary hover:underline transition-all">
                                                Forgot password?
                                            </button>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-sm font-bold bg-gray-900 hover:bg-black text-white rounded-xl transition-all relative overflow-hidden group active:scale-[0.98]"
                                        disabled={isLoading}
                                    >
                                        <AnimatePresence mode="wait">
                                            {isLoading ? (
                                                <motion.div
                                                    key="loader"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="flex items-center justify-center"
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
                                                    {view === "login" ? "Sign In" : "Explore Collections"}
                                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Button>
                                </form>

                                <div className="mt-8 text-center text-sm">
                                    <span className="text-gray-400 font-medium">
                                        {view === "login" ? "New to MadeInFashion?" : "Already have an account?"}
                                    </span>{" "}
                                    <button
                                        onClick={() => setView(view === "login" ? "signup" : "login")}
                                        className="text-gray-900 font-bold hover:underline transition-all ml-1"
                                    >
                                        {view === "login" ? "Create an account" : "Sign in here"}
                                    </button>
                                </div>
                            </div>

                            {/* Footer text */}
                            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center gap-2">
                                <Sparkles className="h-3 w-3 text-amber-400" />
                                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
                                    The Premium Fashion Experience
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
