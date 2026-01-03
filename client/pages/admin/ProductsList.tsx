import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Image as ImageIcon, MessageSquare, Star } from "lucide-react";
import { getProducts, deleteProduct, getProductReviews } from "@/lib/api";
import { toast } from "sonner";
import { Product } from "@/lib/types";

export default function ProductsListAdmin() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Reviews State
  const [selectedProductReviews, setSelectedProductReviews] = useState<any[] | null>(null);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: products = [], isLoading: loading, isError, error: queryError, refetch } = useQuery<Product[]>({
    queryKey: ["products", "admin"],
    queryFn: async () => {
      console.log("[ProductsList] Fetching products...");
      const safetyTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Products request timed out")), 20000)
      );
      const fetchPromise = (async () => {
        const { data, error } = await getProducts();
        if (error) {
          console.error("[ProductsList] Error fetching products:", error);
          throw error;
        }
        console.log(`[ProductsList] Loaded ${data?.length || 0} products`);
        return data || [];
      })();
      return Promise.race([fetchPromise, safetyTimeout]);
    },
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute (formerly cacheTime)
  });

  useEffect(() => {
    if (!supabaseConfigured) return;

    const subscription = supabase
      .channel("public:products-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.category?.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      const { error } = await deleteProduct(id);
      if (error) throw error;
      refetch();
      toast.success("Product deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete product:", err);
      toast.error(`Failed to delete product: ${err.message || "Unknown error"}`);
    } finally {
      setProductToDelete(null);
    }
  };

  const handleViewReviews = async (productId: string) => {
    setReviewsLoading(true);
    setIsReviewsOpen(true);
    setSelectedProductReviews(null);

    try {
      const { data } = await getProductReviews(productId);
      setSelectedProductReviews(data || []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setReviewsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Link to="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Products ({filteredProducts.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading products...
            </div>
          ) : isError ? (
            <div className="py-8 text-center text-destructive">
              Failed to load products: {(queryError as Error)?.message || "Unknown error"}
              <Button variant="outline" className="ml-4" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50/50 dark:bg-slate-800/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="min-w-[300px] py-5">Product Details</TableHead>
                      <TableHead className="min-w-[150px] whitespace-nowrap">Category</TableHead>
                      <TableHead className="min-w-[140px] whitespace-nowrap">Price</TableHead>
                      <TableHead className="min-w-[160px] whitespace-nowrap">Inventory</TableHead>
                      <TableHead className="min-w-[120px] whitespace-nowrap">Status</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden flex-shrink-0 shadow-sm">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-slate-900 text-gray-400 dark:text-gray-600">
                                  <ImageIcon className="h-6 w-6 opacity-30" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</div>
                              <div className="text-sm text-gray-500 line-clamp-1 max-w-[200px]" title={product.description || ""}>
                                {product.description || "No description"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline" className="font-normal bg-gray-50/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300">
                            {product.category?.name || "Uncategorized"}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                              ₵{product.sale_price || product.price}
                            </span>
                            {product.sale_price && (
                              <span className="text-xs text-muted-foreground line-through">
                                ₵{product.price}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {product.stock} {product.stock === 1 ? 'item' : 'items'} in stock
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${product.stock > 0
                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30"
                            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/30"
                            }`}>
                            {product.stock > 0 ? "Active" : "Out of Stock"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-gray-500 dark:text-gray-400"
                              onClick={() => handleViewReviews(product.id)}
                              title="View Reviews"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-500 dark:text-gray-400">
                              <Link to={`/admin/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500 transition-colors"
                              onClick={() => setProductToDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 px-2">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="flex p-4 gap-4">
                      <div className="h-24 w-24 rounded-lg border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden flex-shrink-0 shadow-sm">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-slate-900 text-gray-400 dark:text-gray-600">
                            <ImageIcon className="h-6 w-6 opacity-30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">{product.name}</h4>
                            <span className="font-bold text-indigo-600 whitespace-nowrap">
                              ₵{product.sale_price || product.price}
                            </span>
                          </div>
                          <Badge variant="outline" className="mt-1 font-normal text-[10px] bg-gray-50/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 py-0">
                            {product.category?.name || "Uncategorized"}
                          </Badge>
                        </div>
                        <div className="mt-auto flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{product.stock} in stock</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-slate-800 border-t border-gray-50 dark:border-slate-800">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-none h-10 text-[11px] hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-600 dark:text-gray-400"
                        onClick={() => handleViewReviews(product.id)}
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Reviews
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="rounded-none h-10 text-[11px] hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-600 dark:hover:text-blue-400 text-gray-600 dark:text-gray-400">
                        <Link to={`/admin/products/${product.id}/edit`}>
                          <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-none h-10 text-[11px] text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600"
                        onClick={() => setProductToDelete(product.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => productToDelete && handleDelete(productToDelete)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Reviews</DialogTitle>
            <DialogDescription>Customer feedback for this product.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {reviewsLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading reviews...</div>
            ) : selectedProductReviews?.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No reviews found for this product.</div>
            ) : (
              selectedProductReviews?.map((review) => (
                <div key={review.id} className="border-b border-border pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold text-sm">{review.title}</div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{review.comment}</p>
                  <div className="text-xs text-muted-foreground">
                    By {review.user_name || "Anonymous"} on {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
