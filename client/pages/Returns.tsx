import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { RefreshCcw, PackageCheck, CreditCard, HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCmsContent } from "@/lib/api";
import ReactMarkdown from "react-markdown";

export default function Returns() {
    const { data: cmsData } = useQuery({
        queryKey: ["cms", "returns"],
        queryFn: async () => {
            const { data } = await getCmsContent("returns");
            return data?.content || null;
        },
    });

    const content = {
        title: (cmsData as any)?.title || "Returns & Exchanges",
        info: (cmsData as any)?.info || "We want you to be completely satisfied with your purchase.\n\n### Policy Overview\nItems must be returned within 30 days of the delivery date. To be eligible for a return, your item must be unused, unworn, and in the same condition that you received it.\n\n### How to Return\n1. Log into your account and visit the 'Order History' section.\n2. Select the order and items you wish to return.\n3. Print the provided pre-paid shipping label.\n4. Drop off the package at any authorized carrier location."
    };
    return (
        <Layout>
            <div className="min-h-screen pt-20 pb-16">
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
                        className="bg-background p-8 md:p-12 border border-border rounded-sm shadow-sm prose prose-zinc max-w-none dark:prose-invert mb-16"
                    >
                        <div className="whitespace-pre-line">
                            <ReactMarkdown>{content.info}</ReactMarkdown>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center border-t border-border pt-16">
                        {[
                            { icon: RefreshCcw, title: "30-Day Returns" },
                            { icon: PackageCheck, title: "Easy Request" },
                            { icon: CreditCard, title: "Fast Refunds" },
                            { icon: HelpCircle, title: "24/7 Help" }
                        ].map((item, index) => (
                            <div key={index} className="flex flex-col items-center space-y-2 opacity-60">
                                <item.icon className="w-8 h-8" />
                                <span className="text-xs font-bold uppercase tracking-widest">{item.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
