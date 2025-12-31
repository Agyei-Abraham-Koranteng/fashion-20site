import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, ArrowRight, Github, Chrome, Loader2 } from "lucide-react";
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
                                className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-8 md:p-10">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                                        {view === "login" ? "Welcome Back" : "Create Account"}
                                    </h2>
                                    <p className="text-gray-500 font-light">
                                        {view === "login"
                                            ? "Enter your credentials to access your profile"
                                            : "Join our community of fashion enthusiasts"}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {view === "signup" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="modal-name">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="modal-name"
                                                    placeholder="John Doe"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="pl-10 h-11 border-gray-200 focus:ring-primary"
                                                    required={view === "signup"}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="modal-email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="modal-email"
                                                type="email"
                                                placeholder="name@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 h-11 border-gray-200 focus:ring-primary"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="modal-password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="modal-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 h-11 border-gray-200 focus:ring-primary"
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
                                        className="w-full h-12 text-base font-semibold bg-black hover:bg-zinc-800 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                {view === "login" ? "Continue" : "Join Now"}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-8 relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-gray-200" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-3 text-gray-400 tracking-widest font-bold">Or continue with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <Button variant="outline" className="h-11 border-gray-200 hover:bg-gray-50 flex items-center gap-2">
                                        <Chrome className="h-4 w-4" />
                                        Google
                                    </Button>
                                    <Button variant="outline" className="h-11 border-gray-200 hover:bg-gray-50 flex items-center gap-2">
                                        <Github className="h-4 w-4" />
                                        Github
                                    </Button>
                                </div>

                                <div className="mt-8 text-center text-sm">
                                    <span className="text-gray-500">
                                        {view === "login" ? "New to MadeInFashion?" : "Already have an account?"}
                                    </span>{" "}
                                    <button
                                        onClick={() => setView(view === "login" ? "signup" : "login")}
                                        className="text-black font-bold hover:underline ml-1"
                                    >
                                        {view === "login" ? "Create an account" : "Sign in here"}
                                    </button>
                                </div>
                            </div>

                            {/* Footer text */}
                            <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                    By continuing, you agree to our Terms of Service.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
