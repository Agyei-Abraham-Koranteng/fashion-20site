import { motion } from "framer-motion";
import { getCmsContent } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import ReactMarkdown from "react-markdown";

export default function SizeGuide() {
    const { data: cmsData } = useQuery({
        queryKey: ["cms", "size_guide"],
        queryFn: async () => {
            const { data } = await getCmsContent("size_guide");
            return data?.content || null;
        },
    });

    const content = {
        title: (cmsData as any)?.title || "Size Guide",
        info: (cmsData as any)?.info || "Find your perfect fit with our comprehensive measurement charts."
    };
    return (
        <Layout>
            <div className="min-h-screen pt-20 pb-16">
                <div className="container-wide max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
                    </motion.div>

                    <div className="bg-background border rounded-lg overflow-hidden shadow-sm">
                        <div className="p-6 bg-secondary/20 border-b">
                            <h2 className="text-2xl font-serif">Sizing Information</h2>
                        </div>
                        <div className="p-6 prose prose-zinc max-w-none">
                            <ReactMarkdown>{content.info}</ReactMarkdown>
                        </div>
                    </div>

                    <div className="mt-12 p-6 bg-secondary/30 rounded-lg text-sm text-muted-foreground">
                        <h3 className="font-bold text-foreground mb-2">How to Measure</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong>Bust:</strong> Measure around the fullest part of your bust.</li>
                            <li><strong>Waist:</strong> Measure around the narrowest part of your waistline.</li>
                            <li><strong>Hips:</strong> Measure around the fullest part of your hips.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
