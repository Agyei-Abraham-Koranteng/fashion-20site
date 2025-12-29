import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Upload, X, Image as ImageIcon } from "lucide-react";
import { getProductById, getCategories, createProduct, updateProduct } from "@/lib/api";
import { Product, Category } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ProductFormAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sale_price: "",
    category_id: "",
    stock: "",
    sizes: "",
    colors: "",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    if (isEdit && id) {
      loadProduct(id);
    }
  }, [id, isEdit]);

  const loadCategories = async () => {
    const { data } = await getCategories();
    if (data) {
      setCategories(data);
    }
  };

  const loadProduct = async (productId: string) => {
    setLoading(true);
    const { data } = await getProductById(productId);
    if (data) {
      setFormData({
        name: data.name,
        description: data.description || "",
        price: data.price.toString(),
        sale_price: data.sale_price?.toString() || "",
        category_id: data.category_id,
        stock: data.stock.toString(),
        sizes: data.sizes?.join(", ") || "",
        colors: data.colors?.join(", ") || "",
        image_url: data.images?.[0]?.url || "",
      });
      setImagePreviewUrl(data.images?.[0]?.url || null);
    }
    setLoading(false);
  };

  // Handle image file selection and preview
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
    setFormData((prev) => ({ ...prev, image_url: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1) Upload image to Supabase Storage if a local file is selected
      let finalImageUrl: string | null = formData.image_url?.trim() || null;
      if (imageFile) {
        const safeName = (formData.name || "product")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}-${imageFile.name}`;

        const { error: uploadError } = await supabase
          .storage
          .from("products")
          .upload(path, imageFile, { upsert: false });

        if (uploadError) {
          toast.error("Image upload failed. Please try again.");
          throw uploadError;
        }

        const { data: pub } = supabase.storage.from("products").getPublicUrl(path);
        finalImageUrl = pub.publicUrl;
      }

      // 2) Prepare payload aligned with DB schema (shared/schema.ts)
      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: Number(formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        category_id: formData.category_id, // maps to 'category' column
        stock: Number(formData.stock),
        sizes: formData.sizes ? formData.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
        colors: formData.colors ? formData.colors.split(",").map((c) => c.trim()).filter(Boolean) : [],
        image_url: finalImageUrl,
      };

      // 3) Create or update
      if (isEdit && id) {
        const { error } = await updateProduct(id, payload);
        if (error) throw error;
      } else {
        const { error } = await createProduct(payload);
        if (error) throw error;
      }

      // 4) Navigate back to list; realtime subscription will refresh list
      toast.success(isEdit ? "Product updated successfully" : "Product created successfully");
      navigate("/admin/products");
    } catch (err: any) {
      console.error("Failed to save product:", err);
      const msg = err?.message || err?.error_description || JSON.stringify(err);
      toast.error(`Failed to save product: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-8 text-center">Loading product...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/products")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <p className="text-muted-foreground">
            {isEdit ? "Update product details" : "Create a new product"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Classic White T-Shirt"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Detailed product description..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sale_price">Sale Price</Label>
                    <Input
                      id="sale_price"
                      type="number"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={(e) =>
                        setFormData({ ...formData, sale_price: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                  <Input
                    id="sizes"
                    value={formData.sizes}
                    onChange={(e) =>
                      setFormData({ ...formData, sizes: e.target.value })
                    }
                    placeholder="XS, S, M, L, XL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colors">Colors (comma-separated hex codes)</Label>
                  <Input
                    id="colors"
                    value={formData.colors}
                    onChange={(e) =>
                      setFormData({ ...formData, colors: e.target.value })
                    }
                    placeholder="#000000, #ffffff, #ff0000"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4">
                  {/* Enhanced Preview Section */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/40">
                    {imagePreviewUrl || formData.image_url ? (
                      <>
                        <img
                          src={imagePreviewUrl || formData.image_url}
                          alt="Layout preview"
                          className="h-full w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground shadow-sm transition-transform hover:scale-110"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center space-y-2 text-muted-foreground">
                        <ImageIcon className="h-10 w-10 opacity-20" />
                        <p className="text-sm">No image selected</p>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="image_file" className="text-sm font-medium">Upload Local File</Label>
                      <div className="relative">
                        <Input
                          id="image_file"
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="cursor-pointer pr-10"
                        />
                        <Upload className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image_url" className="text-sm font-medium">Or Paste Image URL</Label>
                      <Input
                        id="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => {
                          const url = e.target.value;
                          setFormData({ ...formData, image_url: url });
                          if (url) {
                            setImageFile(null); // Clear file if URL is pasted
                            if (imagePreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(imagePreviewUrl);
                            setImagePreviewUrl(null);
                          }
                        }}
                        placeholder="https://..."
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={saving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/products")}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
