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

    const getFallbackContent = (slug: string, defaultTitle: string) => {
        if (slug === "cookie_policy") {
            return {
                title: "Cookie Policy",
                info: `
# Cookie Policy

This Cookie Policy explains how **MadeInFashion (LUXE ATELIER)** uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.

## 1. What are cookies?
Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.

## 2. Why do we use cookies?
We use first-party and third-party cookies for several reasons:
*   **Essential Cookies**: These are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.
*   **Performance and Functionality Cookies**: These cookies are used to enhance the performance and functionality of our website but are non-essential to their use.
*   **Analytics and Customization Cookies**: These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are.
*   **Advertising Cookies**: These cookies are used to make advertising messages more relevant to you.

## 3. How can I control cookies?
You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.

## 4. Updates to this policy
We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.

## 5. Contact Us
If you have any questions about our use of cookies or other technologies, please email us at:
**Email**: hospitality@madeinfashion.example.com
`
            };
        }
        return {
            title: defaultTitle,
            info: "Information for this page will be available soon."
        };
    };

    const content = cmsData ? { title: cmsData.title, info: cmsData.info } : getFallbackContent(slug, defaultTitle);

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
