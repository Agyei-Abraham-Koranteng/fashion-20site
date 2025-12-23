import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Truck, Globe, Clock, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCmsContent } from "@/lib/api";
import ReactMarkdown from "react-markdown";

export default function Shipping() {
    const { data: cmsData } = useQuery({
        queryKey: ["cms", "shipping"],
        queryFn: async () => {
            const { data } = await getCmsContent("shipping");
            return data?.content || null;
        },
    });

    const content = {
        title: (cmsData as any)?.title || "Shipping Information",
        info: (cmsData as any)?.info || "Reliable delivery service for your luxury purchases.\n\n### Domestic Shipping\nComplimentary standard shipping on all orders over $150. Standard delivery takes 3-5 business days.\n\n### International Delivery\nWe ship to over 50 countries. International express delivery typically takes 5-10 business days.\n\n### Processing Time\nOrders are processed within 24-48 hours. You will receive a tracking number via email once shipped."
    };
    return (
        <Layout>
            <div className="min-h-screen pt-20 pb-16 bg-secondary/5">
                <div className="container-wide max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-5xl font-serif font-bold mb-4">{content.title}</h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-background p-8 md:p-12 rounded-sm border border-border shadow-sm prose prose-zinc max-w-none dark:prose-invert"
                    >
                        <div className="whitespace-pre-line">
                            <ReactMarkdown>{content.info}</ReactMarkdown>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16 text-center">
                        {[
                            { icon: Truck, title: "Standard" },
                            { icon: Globe, title: "Global" },
                            { icon: Clock, title: "Fast" },
                            { icon: ShieldCheck, title: "Secure" }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.5 }}
                                className="flex flex-col items-center space-y-2 opacity-60"
                            >
                                <item.icon className="w-8 h-8" />
                                <span className="text-xs font-bold uppercase tracking-widest">{item.title}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
