import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { getCmsContent } from "@/lib/api";

export default function Contact() {
    const { data: cmsData } = useQuery({
        queryKey: ["cms", "contact"],
        queryFn: async () => {
            const { data } = await getCmsContent("contact");
            return data?.content || null;
        },
    });

    const contact = {
        title: (cmsData as any)?.title || "Get in Touch",
        subtitle: (cmsData as any)?.subtitle || "Have a question or just want to say hello? We'd love to hear from you.",
        address: (cmsData as any)?.address || "123 Fashion Avenue\nNew York, NY 10012",
        email: (cmsData as any)?.email || "hello@fashionbrand.com",
        phone: (cmsData as any)?.phone || "+1 (555) 123-4567"
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        alert("Thank you for your message! We will get back to you shortly.");
    };

    return (
        <Layout>
            <div className="min-h-screen pt-20 pb-16">
                <div className="container-wide">
                    <div className="text-center mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-bold mb-4"
                        >
                            {contact.title}
                        </motion.h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            {contact.subtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-1 space-y-8"
                        >
                            <div className="bg-secondary/50 p-8 rounded-lg">
                                <h3 className="text-2xl font-serif mb-6">Contact Information</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <MapPin className="w-6 h-6 text-primary mt-1" />
                                        <div>
                                            <h4 className="font-semibold mb-1">Our Studio</h4>
                                            <p className="text-muted-foreground whitespace-pre-line">{contact.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Mail className="w-6 h-6 text-primary mt-1" />
                                        <div>
                                            <h4 className="font-semibold mb-1">Email Us</h4>
                                            <p className="text-muted-foreground">{contact.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Phone className="w-6 h-6 text-primary mt-1" />
                                        <div>
                                            <h4 className="font-semibold mb-1">Call Us</h4>
                                            <p className="text-muted-foreground">{contact.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary text-primary-foreground p-8 rounded-lg">
                                <h3 className="text-2xl font-serif mb-4">Opening Hours</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Monday - Friday</span>
                                        <span>10:00 - 19:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saturday</span>
                                        <span>11:00 - 18:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sunday</span>
                                        <span>Closed</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="lg:col-span-2"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6 bg-background border p-8 rounded-lg shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium">Name</label>
                                        <Input id="name" placeholder="John Doe" required className="input-modern" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                                        <Input id="email" type="email" placeholder="john@example.com" required className="input-modern" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                                    <Input id="subject" placeholder="How can we help?" required className="input-modern" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                                    <Textarea
                                        id="message"
                                        placeholder="Write your message here..."
                                        className="min-h-[150px] resize-none border-input bg-transparent focus-visible:ring-1"
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full btn-primary h-12">
                                    Send Message
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
