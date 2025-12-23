import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { getCmsContent } from "@/lib/api";
import ReactMarkdown from "react-markdown";

export default function PrivacyPolicy() {
    const { data: cmsData } = useQuery({
        queryKey: ["cms", "privacy"],
        queryFn: async () => {
            const { data } = await getCmsContent("privacy");
            return data?.content || null;
        },
    });

    const content = {
        title: (cmsData as any)?.title || "Privacy Policy",
        effective_date: (cmsData as any)?.effective_date || "January 1, 2024",
        info: (cmsData as any)?.info || "We take your privacy seriously. This policy describes how we collect and use your data."
    };
    return (
        <Layout>
            <div className="min-h-screen pt-20 pb-16 bg-secondary/5">
                <div className="container-wide max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <h1 className="text-4xl font-serif font-bold mb-4">{content.title}</h1>
                        <p className="text-muted-foreground text-sm uppercase tracking-widest">Effective Date: {content.effective_date}</p>
                    </motion.div>

                    <div className="bg-background p-8 md:p-12 rounded-sm border border-border shadow-sm prose prose-zinc max-w-none">
                        <div className="text-muted-foreground whitespace-pre-line">
                            <ReactMarkdown>{content.info}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
