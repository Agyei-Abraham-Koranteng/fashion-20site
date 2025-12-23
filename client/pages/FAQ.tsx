import { motion } from "framer-motion";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { getCmsContent } from "@/lib/api";

const defaultFaqs = [
    {
        question: "Do you offer international shipping?",
        answer: "Yes, we ship to over 100 countries worldwide. Shipping costs and times vary depending on the destination."
    },
    {
        question: "What is your return policy?",
        answer: "We accept returns within 30 days of purchase, provided the items are unworn, unwashed, and still have their tags attached."
    }
];


export default function FAQ() {
    const { data: cmsData } = useQuery({
        queryKey: ["cms", "faq"],
        queryFn: async () => {
            const { data } = await getCmsContent("faq");
            return data?.content || null;
        },
    });

    const faqs = (cmsData as any[]) || defaultFaqs;
    return (
        <Layout>
            <div className="min-h-screen pt-20 pb-16 bg-secondary/10">
                <div className="container-wide max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
                        <p className="text-muted-foreground text-lg">
                            Everything you need to know about our products and services.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-background rounded-lg border p-6 shadow-sm"
                    >
                        <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger className="text-lg font-medium text-left">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
}
