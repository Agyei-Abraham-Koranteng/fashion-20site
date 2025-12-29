import { supabase } from "./supabase";
import { Product, Category, Review, Order, Address, ProductImage } from "./types";

// Helper to transform Supabase product row (shared/schema.ts) to UI Product type
const transformProduct = (data: any): Product => ({
  id: String(data.id || ""),
  name: data.name || "Unnamed Product",
  description: data.description ?? "",
  price: Number(data.price || 0),
  sale_price: data.sale_price ? Number(data.sale_price) : undefined,
  category_id: String(data.category_id ?? ""),
  category: data.category_id
    ? {
      id: String(data.category_id),
      name: String(data.category_id),
      slug: String(data.category_id),
      created_at: String(data.created_at ?? "")
    }
    : undefined,
  images: (data.image_url || data.image)
    ? [
      {
        id: `image-${data.id}`,
        product_id: String(data.id),
        url: data.image_url || data.image || "",
        order: 0,
        created_at: String(data.created_at || new Date().toISOString()),
      },
    ]
    : [],
  sizes: Array.isArray(data.sizes) ? data.sizes.map(String) : [],
  colors: Array.isArray(data.colors) ? data.colors.map(String) : [],
  stock: Number(data.stock ?? 0),
  created_at: data.created_at ?? "",
  updated_at: data.updated_at ?? "",
});

// Helper to timeout a promise
const withTimeout = <T>(promise: PromiseLike<T>, timeoutMs = 10000): Promise<T> => {
  let timeoutId: any;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Request timed out")), timeoutMs);
  });

  return Promise.race([
    Promise.resolve(promise).then((res) => {
      clearTimeout(timeoutId);
      return res;
    }),
    timeoutPromise
  ]);
};

// Product queries
export async function getProducts(filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}) {
  try {
    let query = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.category) {
      // In shared schema, category_id is a string field on products
      query = query.ilike("category_id", filters.category);
    }

    if (filters?.minPrice) {
      // Check both price and sale_price. This is harder in simple query, 
      // easiest is to filter for price >= minPrice usually
      query = query.gte("price", filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    const { data, error } = await withTimeout(query);

    if (error) throw error;

    const products = data?.map(transformProduct) || [];
    return { data: products, error: null };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { data: null, error };
  }
}

export async function getProductById(id: string) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (error) throw error;

    return {
      data: data ? transformProduct(data) : null,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { data: null, error };
  }
}

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    return { data: data as Category[] | null, error };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { data: null, error };
  }
}

// Reviews
export async function getProductReviews(productId: string) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    return { data: data as Review[] | null, error };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { data: null, error };
  }
}

export async function createReview(
  productId: string,
  userId: string,
  review: {
    rating: number;
    title: string;
    comment: string;
  },
) {
  try {
    const { data, error } = await (supabase
      .from("reviews") as any)
      .insert([{ product_id: Number(productId), user_id: userId, ...review }])
      .select();

    return { data: data as Review[] | null, error };
  } catch (error) {
    console.error("Error creating review:", error);
    return { data: null, error };
  }
}

export async function getUserReviews(userId: string) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return { data: null, error };
  }
}

// Orders
export async function getOrders(userId: string) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*, product:products(*))") // Fetch items and nested products
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return { data: data as any[] | null, error };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { data: null, error };
  }
}

export async function getAllOrders() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*, product:products(*))")
      .order("created_at", { ascending: false });

    // Fetch user emails for these orders (since we can't join auth.users easily)
    // Or we could rely on profiles if we had them linked.
    // For now, return what we have. API might need to fetch profiles if we want customer names.

    return { data: data as any[] | null, error };
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return { data: null, error };
  }
}

export async function createOrder(
  userId: string,
  order: {
    items: Array<{
      product_id: number; // Changed to number to match schema
      quantity: number;
      price: number;
      size: string;
      color: string;
    }>;
    shipping_address: Address | any;
    billing_address: Address | any;
    notes?: string;
  },
) {
  try {
    const totalPrice = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const { data: orderData, error: orderError } = await (supabase
      .from("orders") as any)
      .insert([
        {
          user_id: userId,
          status: "pending", // "pending" orders are now reservations
          total_price: totalPrice,
          shipping_address: order.shipping_address,
          billing_address: order.billing_address,
          notes: order.notes,
        },
      ])
      .select()
      .single();

    if (orderError || !orderData) {
      throw orderError;
    }

    const orderId = orderData.id;

    const { data: itemsData, error: itemsError } = await (supabase
      .from("order_items") as any)
      .insert(
        order.items.map((item) => ({
          order_id: Number(orderId),
          product_id: Number(item.product_id),
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color
        })),
      )
      .select();

    if (itemsError) throw itemsError;

    return {
      data: { ...orderData, items: itemsData },
      error: null,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return { data: null, error };
  }
}

// Admin API Functions

export async function createProduct(product: {
  name: string;
  description?: string | null;
  price: number;
  category_id: string; // maps to 'category' column in DB
  stock: number;
  sizes?: string[];
  colors?: string[];
  image_url?: string | null; // Main image URL
}) {
  try {
    const payload = {
      name: product.name,
      description: product.description ?? null,
      price: product.price,
      image_url: product.image_url ?? null,
      category_id: product.category_id, // map to DB column
      stock: product.stock,
      sizes: product.sizes ?? [],
      colors: product.colors ?? [],
      sale_price: product.sale_price ?? null,
    };
    const { data, error } = await (supabase
      .from("products") as any)
      .insert([payload])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error creating product:", error);
    return { data: null, error };
  }
}

export async function updateProduct(
  id: string,
  updates: Partial<{
    name: string;
    description?: string | null;
    price: number;
    sale_price: number | null;
    category_id: string; // maps to 'category'
    stock: number;
    sizes?: string[];
    colors?: string[];
    image_url?: string | null;
  }>
) {
  try {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.sale_price !== undefined) payload.sale_price = updates.sale_price;
    if (updates.category_id !== undefined) payload.category_id = updates.category_id;
    if (updates.stock !== undefined) payload.stock = updates.stock;
    if (updates.sizes !== undefined) payload.sizes = updates.sizes;
    if (updates.colors !== undefined) payload.colors = updates.colors;
    if (updates.image_url !== undefined) payload.image_url = updates.image_url;

    const { data, error } = await (supabase
      .from("products") as any)
      .update(payload)
      .eq("id", Number(id))
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error updating product:", error);
    return { data: null, error };
  }
}

export async function deleteProduct(id: string) {
  try {
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", Number(id))
      .select();

    return { data, error };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { data: null, error };
  }
}

export async function getCustomers() {
  try {
    const { data, error } = await withTimeout(supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false }));

    return { data, error };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { data: null, error };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    return { data, error };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { data: null, error };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { data, error } = await (supabase
      .from("orders") as any)
      .update({ status })
      .eq("id", Number(orderId))
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { data: null, error };
  }
}

export async function getAdminStats() {
  try {
    // Basic stats aggregation
    const { count: productsCount } = await withTimeout(supabase
      .from('products')
      .select('*', { count: 'exact', head: true }));

    const { count: ordersCount } = await withTimeout(supabase
      .from('orders')
      .select('*', { count: 'exact', head: true }));

    const { data: orders } = await withTimeout(supabase
      .from('orders')
      .select('total_price'));

    const totalRevenue = (orders as any[])?.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0) || 0;

    const { count: customersCount } = await withTimeout(supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true }));

    return {
      data: {
        totalRevenue,
        totalOrders: ordersCount || 0,
        totalProducts: productsCount || 0,
        activeCustomers: customersCount || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return { data: null, error };
  }
}

// CMS Functions
export async function getCmsContent(key: string) {
  try {
    const { data, error } = await supabase
      .from("cms_content")
      .select("*")
      .eq("key", key)
      .maybeSingle();

    return { data, error };
  } catch (error) {
    console.error(`Error fetching CMS content for ${key}:`, error);
    return { data: null, error };
  }
}

export async function updateCmsContent(key: string, content: any) {
  try {
    console.log(`Payload for ${key}:`, content);
    const { data, error } = await (supabase
      .from("cms_content") as any)
      .upsert({ key, content, updated_at: new Date().toISOString() }, { onConflict: "key" })
      .select()
      .single();

    if (error) {
      console.error(`Supabase error updating CMS content for ${key}:`, error);
    } else {
      console.log(`Success updating CMS content for ${key}:`, data);
    }
    return { data, error };
  } catch (error) {
    console.error(`Caught error updating CMS content for ${key}:`, error);
    return { data: null, error };
  }
}
