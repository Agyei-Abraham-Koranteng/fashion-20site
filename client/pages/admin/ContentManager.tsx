import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { getCmsContent, updateCmsContent } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function ContentManager() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState<any>({
        home_hero: {
            slides: [
                { title: "", subtitle: "", image_url: "", cta_text: "", cta_link: "/shop" }
            ]
        },
        about: { title: "", story: "", mission: "" },
        shipping: { title: "", info: "" },
        returns: { title: "", info: "" },
        privacy: { title: "", effective_date: "", info: "" },
        terms: { title: "", last_updated: "", info: "" },
        cookie_policy: { title: "", info: "" },
        contact: { title: "", subtitle: "", address: "", email: "", phone: "" },
        careers: { title: "", info: "" },
        press: { title: "", info: "" },
        blog: { title: "", info: "" },
        sustainability: { title: "", info: "" },
        size_guide: { title: "", info: "" },
        faq: []
    });

    const cmsKeys = [
        "home_hero", "about", "shipping", "returns", "privacy", "terms", "cookie_policy",
        "contact", "careers", "press", "blog", "sustainability", "size_guide", "faq"
    ];

    useEffect(() => {
        loadAllContent();
    }, []);

    const loadAllContent = async () => {
        setLoading(true);
        try {
            const newContent = { ...content };

            // Load all keys in parallel
            const results = await Promise.all(
                cmsKeys.map(async (key) => {
                    const { data } = await getCmsContent(key);
                    return { key, data };
                })
            );

            results.forEach(({ key, data }) => {
                if (data?.content) {
                    newContent[key] = data.content;
                }
            });

            setContent(newContent);
        } catch (error) {
            console.error("Failed to load CMS content:", error);
            toast.error("Failed to load some content sections.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string) => {
        setSaving(true);
        const { error } = await updateCmsContent(key, content[key]);
        if (error) {
            toast.error(`Error: ${error.message || 'Unknown error'}`);
        } else {
            toast.success(`${key.replace('_', ' ')} updated successfully`);
        }
        setSaving(false);
    };

    const updateField = (key: string, field: string, value: any) => {
        setContent((prev: any) => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    // Hero Slide Management
    const addHeroSlide = () => {
        const newSlide = { title: "", subtitle: "", image_url: "", cta_text: "Shop Collection", cta_link: "/shop" };
        setContent((prev: any) => ({
            ...prev,
            home_hero: {
                ...prev.home_hero,
                slides: [...(prev.home_hero.slides || []), newSlide]
            }
        }));
    };

    const removeHeroSlide = (index: number) => {
        setContent((prev: any) => ({
            ...prev,
            home_hero: {
                ...prev.home_hero,
                slides: prev.home_hero.slides.filter((_: any, i: number) => i !== index)
            }
        }));
    };

    const updateHeroSlide = (index: number, field: string, value: string) => {
        const newSlides = [...content.home_hero.slides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setContent((prev: any) => ({
            ...prev,
            home_hero: { ...prev.home_hero, slides: newSlides }
        }));
    };

    const moveHeroSlide = (index: number, direction: 'up' | 'down') => {
        const newSlides = [...content.home_hero.slides];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newSlides.length) return;

        [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
        setContent((prev: any) => ({
            ...prev,
            home_hero: { ...prev.home_hero, slides: newSlides }
        }));
    };

    // FAQ Management
    const addFaq = () => {
        setContent((prev: any) => ({
            ...prev,
            faq: [...prev.faq, { question: "", answer: "" }]
        }));
    };

    const removeFaq = (index: number) => {
        setContent((prev: any) => ({
            ...prev,
            faq: prev.faq.filter((_: any, i: number) => i !== index)
        }));
    };

    const updateFaq = (index: number, field: string, value: string) => {
        const newFaq = [...content.faq];
        newFaq[index] = { ...newFaq[index], [field]: value };
        setContent((prev: any) => ({ ...prev, faq: newFaq }));
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container py-6 sm:py-10 px-4 sm:px-6 max-w-5xl space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Content Manager</h2>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Manage dynamic text and images across your boutique store</p>
                </div>
            </div>

            <Tabs defaultValue="homepage" className="space-y-6">
                <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
                    <TabsList className="bg-muted p-1 inline-flex w-auto min-w-full sm:min-w-0">
                        <TabsTrigger value="homepage" className="px-6">Homepage</TabsTrigger>
                        <TabsTrigger value="brand" className="px-6">Brand</TabsTrigger>
                        <TabsTrigger value="support" className="px-6">Support</TabsTrigger>
                        <TabsTrigger value="legal" className="px-6">Legal</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="homepage" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Hero Slideshow</CardTitle>
                                <CardDescription>Manage the main banner slides on the homepage</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={addHeroSlide} className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Add Slide
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {content.home_hero.slides?.map((slide: any, index: number) => (
                                <div key={index} className="space-y-4 p-4 md:p-6 border rounded-lg relative group bg-secondary/5">
                                    <div className="flex justify-end gap-2 md:absolute md:top-4 md:right-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity mb-4 md:mb-0">
                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => moveHeroSlide(index, 'up')} disabled={index === 0}>
                                            <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => moveHeroSlide(index, 'down')} disabled={index === content.home_hero.slides.length - 1}>
                                            <ArrowDown className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeHeroSlide(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Main Title</Label>
                                                <Input
                                                    value={slide.title}
                                                    onChange={(e) => updateHeroSlide(index, "title", e.target.value)}
                                                    placeholder="e.g., The Art of Modern Elegance"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Subtitle</Label>
                                                <Textarea
                                                    value={slide.subtitle}
                                                    onChange={(e) => updateHeroSlide(index, "subtitle", e.target.value)}
                                                    placeholder="Description below the title"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Image URL</Label>
                                                <Input
                                                    value={slide.image_url}
                                                    onChange={(e) => updateHeroSlide(index, "image_url", e.target.value)}
                                                    placeholder="Unsplash URL or other image path"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>CTA Button Text</Label>
                                                    <Input
                                                        value={slide.cta_text}
                                                        onChange={(e) => updateHeroSlide(index, "cta_text", e.target.value)}
                                                        placeholder="Shop Collection"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>CTA Link</Label>
                                                    <Input
                                                        value={slide.cta_link}
                                                        onChange={(e) => updateHeroSlide(index, "cta_link", e.target.value)}
                                                        placeholder="/shop"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button onClick={() => handleSave("home_hero")} disabled={saving} className="w-full">
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save All Slides
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="brand" className="space-y-6">
                    <div className="grid gap-6">
                        {["about", "sustainability", "careers", "press", "blog"].map((key) => (
                            <Card key={key}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="capitalize">{key === 'about' ? 'About Us' : key}</CardTitle>
                                    <Button size="sm" onClick={() => handleSave(key)} disabled={saving}>
                                        <Save className="mr-2 h-4 w-4" /> Save
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Page Title</Label>
                                        <Input value={content[key].title} onChange={(e) => updateField(key, "title", e.target.value)} />
                                    </div>
                                    {key === 'about' ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Our Story (Markdown)</Label>
                                                <Textarea className="min-h-[150px]" value={content.about.story} onChange={(e) => updateField("about", "story", e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Our Mission</Label>
                                                <Textarea value={content.about.mission} onChange={(e) => updateField("about", "mission", e.target.value)} />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label>Page Content (Markdown)</Label>
                                            <Textarea className="min-h-[250px]" value={content[key].info} onChange={(e) => updateField(key, "info", e.target.value)} />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="support" className="space-y-6">
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Frequently Asked Questions</CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={addFaq}><Plus className="mr-2 h-4 w-4" /> Add FAQ</Button>
                                    <Button size="sm" onClick={() => handleSave("faq")} disabled={saving}><Save className="mr-2 h-4 w-4" /> Save</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {content.faq.map((item: any, index: number) => (
                                    <div key={index} className="space-y-4 p-4 border rounded-sm relative group bg-secondary/10">
                                        <Button variant="ghost" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => removeFaq(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <div className="space-y-2">
                                            <Label>Question</Label>
                                            <Input value={item.question} onChange={(e) => updateFaq(index, "question", e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Answer</Label>
                                            <Textarea value={item.answer} onChange={(e) => updateFaq(index, "answer", e.target.value)} />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {["shipping", "returns", "size_guide"].map((key) => (
                                <Card key={key}>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="capitalize">{key.replace('_', ' ')}</CardTitle>
                                        <Button size="sm" onClick={() => handleSave(key)} disabled={saving}><Save className="mr-2 h-4 w-4" /> Save</Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input value={content[key].title} onChange={(e) => updateField(key, "title", e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Info (Markdown)</Label>
                                            <Textarea className="min-h-[200px]" value={content[key].info} onChange={(e) => updateField(key, "info", e.target.value)} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            <Card className="md:col-span-2">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Contact Information</CardTitle>
                                    <Button size="sm" onClick={() => handleSave("contact")} disabled={saving}><Save className="mr-2 h-4 w-4" /> Save</Button>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2"><Label>Title</Label><Input value={content.contact.title} onChange={(e) => updateField("contact", "title", e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Subtitle</Label><Textarea value={content.contact.subtitle} onChange={(e) => updateField("contact", "subtitle", e.target.value)} /></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2"><Label>Address</Label><Textarea value={content.contact.address} onChange={(e) => updateField("contact", "address", e.target.value)} /></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Email</Label><Input value={content.contact.email} onChange={(e) => updateField("contact", "email", e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Phone</Label><Input value={content.contact.phone} onChange={(e) => updateField("contact", "phone", e.target.value)} /></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="legal" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {["privacy", "terms", "cookie_policy"].map((key) => (
                            <Card key={key} className={key === 'cookie_policy' ? 'md:col-span-2' : ''}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="capitalize">{key === 'privacy' ? 'Privacy Policy' : key === 'terms' ? 'Terms of Service' : 'Cookie Policy'}</CardTitle>
                                    <Button size="sm" onClick={() => handleSave(key)} disabled={saving}><Save className="mr-2 h-4 w-4" /> Save</Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input value={content[key].title} onChange={(e) => updateField(key, "title", e.target.value)} />
                                    </div>
                                    {key !== 'cookie_policy' && (
                                        <div className="space-y-2">
                                            <Label>{key === 'privacy' ? 'Effective Date' : 'Last Updated'}</Label>
                                            <Input
                                                value={key === 'privacy' ? content.privacy.effective_date : content.terms.last_updated}
                                                onChange={(e) => updateField(key, key === 'privacy' ? "effective_date" : "last_updated", e.target.value)}
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label>Policy Content (Markdown)</Label>
                                        <Textarea className="min-h-[250px]" value={content[key].info} onChange={(e) => updateField(key, "info", e.target.value)} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
