import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { getCmsContent, saveContactMessage } from "@/lib/api";
import { toast } from "sonner";

export default function Contact() {
    const { data: cmsData } = useQuery({
        queryKey: ["cms", "contact"],
        queryFn: async () => {
            const { data } = await getCmsContent("contact");
            return data?.content || null;
        },
    });

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const contact = {
        title: (cmsData as any)?.title || "Get in Touch",
        subtitle: (cmsData as any)?.subtitle || "Have a question or just want to say hello? We'd love to hear from you.",
        address: (cmsData as any)?.address || "123 Fashion Street, Design District\nNew York, NY 10012",
        email: (cmsData as any)?.email || "contact@fashionbrand.com",
        phone: (cmsData as any)?.phone || "+1 (555) 000-0000"
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const subject = formData.get("subject") as string;
        const message = formData.get("message") as string;

        try {
            const { error } = await saveContactMessage({ name, email, subject, message });
            if (error) throw error;

            toast.custom((t) => (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex items-center gap-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-md"
                >
                    <div className="flex-shrink-0">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                        >
                            <motion.svg
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="w-6 h-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                            >
                                <motion.path
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </motion.svg>
                        </motion.div>
                    </div>
                    <div className="flex-1">
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="font-bold text-lg"
                        >
                            Message Sent!
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                            className="text-white/90 text-sm"
                        >
                            Thank you! We'll get back to you shortly.
                        </motion.p>
                    </div>
                    <button
                        onClick={() => toast.dismiss(t)}
                        className="text-white/70 hover:text-white transition-colors p-1"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </motion.div>
            ), { duration: 5000 });

            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error("Error submitting contact form:", error);
            toast.custom((t) => (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex items-center gap-4 bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-md"
                >
                    <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="font-bold">Oops! Something went wrong</p>
                        <p className="text-white/90 text-sm">Please try again later.</p>
                    </div>
                    <button onClick={() => toast.dismiss(t)} className="text-white/70 hover:text-white p-1">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </motion.div>
            ), { duration: 5000 });
        } finally {
            setIsSubmitting(false);
        }
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
                                        <Input id="name" name="name" placeholder="John Doe" required className="input-modern" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                                        <Input id="email" name="email" type="email" placeholder="john@example.com" required className="input-modern" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                                    <Input id="subject" name="subject" placeholder="How can we help?" required className="input-modern" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        placeholder="Write your message here..."
                                        className="min-h-[150px] resize-none border-input bg-transparent focus-visible:ring-1"
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full btn-primary h-12" disabled={isSubmitting}>
                                    {isSubmitting ? "Sending..." : "Send Message"}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
