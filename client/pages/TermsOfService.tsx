import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { getCmsContent } from "@/lib/api";
import ReactMarkdown from "react-markdown";

export default function TermsOfService() {
    const { data: cmsData } = useQuery({
        queryKey: ["cms", "terms"],
        queryFn: async () => {
            const { data } = await getCmsContent("terms");
            return data?.content || null;
        },
    });

    const content = {
        title: (cmsData as any)?.title || "Terms of Service",
        last_updated: (cmsData as any)?.last_updated || "January 1, 2025",
        info: (cmsData as any)?.info || `
# Terms of Service

Welcome to **MadeInFashion (LUXE ATELIER)**. These Terms of Service ("Terms") govern your access to and use of our website and services. By accessing or using our services, you agree to be bound by these Terms.

## 1. Use of Services
You may use our services for lawful purposes only. You agree not to:
*   Violate any applicable laws or regulations.
*   Infringe upon the intellectual property rights of others.
*   Transmit any harmful code or interfere with the security of our services.
*   Use any automated system to access the site for unauthorized purposes.

## 2. Accounts and Security
When you create an account with us, you must provide accurate and complete information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.

## 3. Intellectual Property
All content on this website, including text, graphics, logos, images, and software, is the property of **MadeInFashion** or its content suppliers and is protected by international copyright and intellectual property laws.

## 4. Product Sales and Payments
We reserve the right to refuse or cancel any order for any reason. Prices are subject to change without notice. Payments are processed through secure third-party gateways.

## 5. Limitation of Liability
To the maximum extent permitted by law, **MadeInFashion** shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.

## 6. Governing Law
These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the company is registered, without regard to its conflict of law provisions.

## 7. Changes to Terms
We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page with an updated "Last Updated" date.

## 8. Contact Information
For any questions regarding these Terms, please contact us at:
**Email**: legal@madeinfashion.example.com
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
                        <p className="text-muted-foreground text-sm uppercase tracking-widest">Last Updated: {content.last_updated}</p>
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
