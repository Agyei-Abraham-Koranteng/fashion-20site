import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface ComingSoonProps {
    title?: string;
}

export default function ComingSoon({ title = "Coming Soon" }: ComingSoonProps) {
    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center bg-secondary/5">
                <div className="container-wide text-center max-w-2xl px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        <div className="flex justify-center">
                            <div className="p-4 bg-primary text-primary-foreground rounded-full animate-pulse">
                                <Sparkles className="w-8 h-8" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight">
                                {title}
                            </h1>
                            <p className="text-xl text-muted-foreground font-light leading-relaxed">
                                We are currently refining this section to bring you a premium experience.
                                Something extraordinary is in the works.
                            </p>
                        </div>

                        <div className="pt-8 border-t border-border/60">
                            <p className="text-sm text-muted-foreground mb-6 uppercase tracking-[0.2em]">
                                Explore our latest collections in the meantime
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/shop" className="btn-primary px-8 py-3">
                                    Shop New Arrivals
                                </Link>
                                <Link to="/" className="btn-secondary px-8 py-3">
                                    Return Home
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
}
