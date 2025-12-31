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
        effective_date: (cmsData as any)?.effective_date || "January 1, 2025",
        info: (cmsData as any)?.info || `
# Privacy Policy

At **MadeInFashion (LUXE ATELIER)**, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and use our services.

## 1. Information We Collect
We collect information that you provide directly to us, including:
*   **Personal Identifiers**: Name, email address, shipping/billing address, and phone number.
*   **Payment Information**: Processed securely through our payment partners; we do not store full credit card details on our servers.
*   **Account Credentials**: Passwords and security information used for authentication.
*   **Order History**: Details of the products you have purchased from us.

## 2. How We Use Your Information
We use the collected data for various purposes:
*   To process and fulfill your orders, including shipping and returns.
*   To communicate with you about your account, orders, and promotional offers (if opted-in).
*   To improve our website functionality and customer service.
*   To comply with legal obligations and prevent fraudulent activities.

## 3. Data Protection
We implement industry-standard security measures to protect your personal data. This includes SSL encryption for data transmission and secure server environments. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.

## 4. Third-Party Services
We may share your information with trusted third-party partners to provide our services, such as:
*   Logistics and shipping providers.
*   Payment processors.
*   Cloud infrastructure and analytics tools.

## 5. Your Rights
Depending on your location, you may have rights regarding your personal data, including the right to access, correct, or delete your information. To exercise these rights, please contact our support team.

## 6. Contact Us
If you have any questions about this Privacy Policy, please contact us at:
**Email**: privacy@madeinfashion.example.com
`
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
