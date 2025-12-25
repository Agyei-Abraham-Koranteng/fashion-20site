import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { getCmsContent } from "@/lib/api";

import ReactMarkdown from "react-markdown";

export default function About() {
    const { data: cmsData } = useQuery({
        queryKey: ["cms", "about"],
        queryFn: async () => {
            const { data } = await getCmsContent("about");
            return data?.content || null;
        },
    });

    const content = {
        title: cmsData?.title || "Crafting Timeless Elegance Since 1994",
        story: cmsData?.story || "Founded in the heart of the fashion district, MadeInFashion began with a simple yet ambitious vision: to create clothing that transcends trends and celebrates the enduring beauty of contemporary design. What started as a curated collection has grown into a destination for those who seek sophistication, quality, and style that stands the test of time.\n\nOur journey is paved with a commitment to excellence. We believe that true style lies in the details—the choice of the finest materials, the precision of a tailored cut, and the confidence it brings to the wearer. Every piece in our collection is selected to empower our customers and inspire confidence in every moment.",
        mission: cmsData?.mission || "At MadeInFashion, our mission is to redefine modern style through accessible luxury and timeless design. We strive to curate collections that respect both the creator and the consumer, ensuring that beauty is available to everyone."
    };
    return (
        <Layout>
            <div className="min-h-screen pt-20 pb-16">
                {/* Hero Section */}
                <section className="relative h-[60vh] flex items-center justify-center bg-secondary overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
                        alt="Fashion Studio"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="relative z-20 container-wide text-center text-white">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-7xl font-bold mb-6 font-serif"
                        >
                            {content.title}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-xl md:text-2xl font-light max-w-2xl mx-auto"
                        >
                            Redefining luxury for the modern individual since 2023. At MadeInFashion, we believe...
                        </motion.p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="section-padding container-wide">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-4xl font-bold mb-6">Our Philosophy</h2>
                            <div className="text-lg text-muted-foreground mb-6 leading-relaxed prose prose-zinc max-w-none">
                                <ReactMarkdown>{content.story}</ReactMarkdown>
                            </div>
                            <div className="text-lg text-muted-foreground mb-8 leading-relaxed italic prose prose-zinc max-w-none">
                                <ReactMarkdown>{content.mission}</ReactMarkdown>
                            </div>
                            <Button className="btn-primary">View Our Collections</Button>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="aspect-[4/5] bg-gray-200 rounded-sm overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1000"
                                    alt="Craftsmanship"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white p-4 shadow-xl hidden md:block">
                                <img
                                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=500"
                                    alt="Detail"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-24 bg-secondary/30">
                    <div className="container-wide text-center">
                        <h2 className="text-4xl font-bold mb-16">Core Values</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                { title: "Quality", desc: "Uncompromising attention to detail in every stitch." },
                                { title: "Sustainability", desc: "Eco-friendly materials and ethical manufacturing." },
                                { title: "Innovation", desc: "Pushing boundaries in design and comfort." }
                            ].map((value, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.2 }}
                                    className="p-8 bg-background border border-border shadow-sm hover:shadow-lg transition-shadow duration-300"
                                >
                                    <h3 className="text-2xl font-serif mb-4">{value.title}</h3>
                                    <p className="text-muted-foreground">{value.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
