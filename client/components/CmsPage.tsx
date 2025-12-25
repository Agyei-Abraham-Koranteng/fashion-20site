import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { getCmsContent } from "@/lib/api";
import ReactMarkdown from "react-markdown";

interface CmsPageProps {
    slug: string;
    defaultTitle: string;
}

export default function CmsPage({ slug, defaultTitle }: CmsPageProps) {
    const { data: cmsData, isLoading } = useQuery({
        queryKey: ["cms", slug],
        queryFn: async () => {
            const { data } = await getCmsContent(slug);
            return data?.content || null;
        },
    });

    const content = {
        title: cmsData?.title || defaultTitle,
        info: cmsData?.info || "Information for this page will be available soon."
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-screen pt-20 flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground italic">Loading content...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen pt-20 pb-16 bg-secondary/5 font-sans">
                <div className="container-wide max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 border-b border-border pb-8"
                    >
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{content.title}</h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-zinc lg:prose-xl max-w-none dark:prose-invert"
                    >
                        <ReactMarkdown>{content.info}</ReactMarkdown>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
}
