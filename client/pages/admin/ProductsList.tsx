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
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { getProducts, deleteProduct } from "@/lib/api";
import { toast } from "sonner";
import { Product } from "@/lib/types";

export default function ProductsListAdmin() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

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

      <Card>
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
              <div className="hidden md:block rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="min-w-[300px] py-5">Product Details</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Inventory</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-xl border border-gray-100 bg-white overflow-hidden flex-shrink-0 shadow-sm">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
                                  <ImageIcon className="h-6 w-6 opacity-30" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500 line-clamp-1 max-w-[200px]" title={product.description || ""}>
                                {product.description || "No description"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal bg-gray-50/50">
                            {product.category?.name || "Uncategorized"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">
                              ₵{product.sale_price || product.price}
                            </span>
                            {product.sale_price && (
                              <span className="text-xs text-muted-foreground line-through">
                                ₵{product.price}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                            <span className="text-sm font-medium text-gray-700">{product.stock} in stock</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 0
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                            {product.stock > 0 ? "Active" : "Out of Stock"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 hover:text-blue-600 transition-colors">
                              <Link to={`/admin/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
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
              <div className="md:hidden divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="p-4 space-y-4">
                    <div className="flex items-start gap-4">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="h-20 w-20 rounded-lg object-cover flex-shrink-0 border"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900 truncate pr-4">{product.name}</h4>
                          <span className="font-bold text-blue-600">
                            ₵{product.sale_price || product.price}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                          {product.description}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Badge variant="outline" className="bg-gray-50">
                            {product.category?.name || "Uncategorized"}
                          </Badge>
                          <Badge
                            variant={product.stock > 10 ? "secondary" : "destructive"}
                            className="text-[10px]"
                          >
                            {product.stock} in stock
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Link to={`/admin/products/${product.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/5"
                        onClick={() => setProductToDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
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
    </div>
  );
}
