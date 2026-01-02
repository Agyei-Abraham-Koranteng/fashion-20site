import { supabase } from "./supabaseClient";
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

// Helper to timeout a promise with detailed logging
const withTimeout = <T>(promise: PromiseLike<T>, timeoutMs = 45000, context = "Unknown"): Promise<T> => {
  const startTime = Date.now();
  console.log(`[API] Starting request: ${context} (timeout: ${timeoutMs}ms)`);

  let timeoutId: any;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      console.error(`[API] Request TIMED OUT: ${context} after ${Date.now() - startTime}ms`);
      reject(new Error(`Request timed out: ${context}`));
    }, timeoutMs);
  });

  return Promise.race([
    Promise.resolve(promise).then((res) => {
      clearTimeout(timeoutId);
      console.log(`[API] Request COMPLETED: ${context} in ${Date.now() - startTime}ms`);
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
  console.log("[API] getProducts called with filters:", filters);
  try {
    let query = supabase
      .from("products")
      .select("*")
      .is("deleted_at", null) // Filter out soft deleted
      .order("created_at", { ascending: false });

    if (filters?.category) {
      query = query.ilike("category_id", filters.category);
    }

    if (filters?.minPrice) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    const { data, error } = await withTimeout((query as any).then((r: any) => r), 20000, "getProducts");

    if (error) {
      console.error("[API] getProducts Supabase error:", error);
      throw error;
    }

    const products = data?.map(transformProduct) || [];
    console.log(`[API] getProducts success: returned ${products.length} products`);
    return { data: products, error: null };
  } catch (error) {
    console.error("[API] getProducts caught error:", error);
    return { data: null, error };
  }
}

export async function getProductById(id: string) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", Number(id))
      .is("deleted_at", null) // Filter out soft deleted
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

export const addProductReview = async (review: {
  product_id: string;
  rating: number;
  title: string;
  comment: string;
  user_name?: string;
}) => {
  return await supabase.from("product_reviews").insert([review]).select().single();
};

export const addSystemFeedback = async (feedback: {
  rating: number;
  feedback: string;
}) => {
  return await supabase.from("system_feedback").insert([feedback]).select().single();
};

export const getSystemFeedback = async () => {
  return await supabase
    .from("system_feedback")
    .select("*")
    .order("created_at", { ascending: false });
};

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
  console.log("[API] getAllOrders called");
  try {
    const { data, error } = await withTimeout(
      (supabase
        .from("orders")
        .select("*, items:order_items(*, product:products(*))")
        .order("created_at", { ascending: false }) as any).then((r: any) => r),
      20000,
      "getAllOrders (nested)"
    );

    if (error) {
      console.error("[API] getAllOrders Supabase error:", error);
      throw error;
    }

    console.log(`[API] getAllOrders success: returned ${data?.length} orders`);
    return { data: data as any[] | null, error: null };
  } catch (error) {
    console.error("[API] getAllOrders caught error:", error);
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
  sale_price?: number | null;
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
      .update({ deleted_at: new Date().toISOString() }) // Soft delete
      .eq("id", Number(id))
      .select();

    return { data, error };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { data: null, error };
  }
}

export async function getCustomers() {
  console.log("[API] getCustomers called");
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("profiles")
        .select("*")
        .order("updated_at", { ascending: false }),
      45000,
      "getCustomers"
    );

    if (error) {
      console.error("[API] getCustomers Supabase error:", error);
      throw error;
    }

    console.log(`[API] getCustomers success: returned ${data?.length} customers`);
    return { data, error: null };
  } catch (error) {
    console.error("[API] getCustomers caught error:", error);
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
    // Calculate date for active customers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeCustomerDate = thirtyDaysAgo.toISOString();

    // Parallelize stats aggregation with individual error handling
    const [pResult, oResult, rResult, cResult] = await Promise.allSettled([
      withTimeout(supabase.from('products').select('*', { count: 'exact', head: true }), 15000, "stats:products"),
      withTimeout(supabase.from('orders').select('*', { count: 'exact', head: true }), 15000, "stats:orders_count"),
      withTimeout(supabase.from('orders').select('total_price'), 20000, "stats:revenue"),
      // Active customers: users who logged in within last 30 days
      withTimeout(
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('last_login', activeCustomerDate),
        15000,
        "stats:active_customers"
      )
    ]);

    const productsCount = pResult.status === 'fulfilled' ? (pResult.value.count || 0) : 0;
    const ordersCount = oResult.status === 'fulfilled' ? (oResult.value.count || 0) : 0;
    const orders = rResult.status === 'fulfilled' ? (rResult.value.data as any[] || []) : [];
    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0) || 0;
    const customersCount = cResult.status === 'fulfilled' ? (cResult.value.count || 0) : 0;

    return {
      data: {
        totalRevenue,
        totalOrders: ordersCount,
        totalProducts: productsCount,
        activeCustomers: customersCount,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return { data: null, error };
  }
}

// Update user's last login timestamp for active customer tracking
export async function updateLastLogin(userId: string) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating last login:', error);
      return { error };
    }

    console.log(`[Auth] Updated last_login for user ${userId}`);
    return { error: null };
  } catch (error) {
    console.error('Error updating last login:', error);
    return { error };
  }
}

// CMS Functions
export async function getCmsContent(key: string) {
  try {
    const { data, error } = await withTimeout(supabase
      .from("cms_content")
      .select("*")
      .eq("key", key)
      .maybeSingle());

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

export async function getNewsletterSubscribers() {
  try {
    const { data, error } = await withTimeout(supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false }));

    return { data, error };
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return { data: null, error };
  }
}

export async function deleteNewsletterSubscriber(id: string) {
  try {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", id);

    return { error };
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    return { error };
  }
}

// Contact Messages
export async function saveContactMessage(message: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  console.log("[API] saveContactMessage called", message);
  try {
    const { data, error } = await withTimeout(
      supabase.from("contact_messages").insert([message]),
      30000,
      "saveContactMessage"
    );

    if (error) {
      console.error("[API] saveContactMessage Supabase error:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("[API] saveContactMessage caught error:", error);
    return { data: null, error };
  }
}

export async function getContactMessages() {
  console.log("[API] getContactMessages called");
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false }),
      45000,
      "getContactMessages"
    );

    if (error) {
      console.error("[API] getContactMessages Supabase error:", error);
      throw error;
    }

    console.log(`[API] getContactMessages success: returned ${data?.length} messages`);
    return { data, error: null };
  } catch (error) {
    console.error("[API] getContactMessages caught error:", error);
    return { data: null, error };
  }
}

export async function updateContactMessageStatus(id: number, status: string) {
  console.log("[API] updateContactMessageStatus called", { id, status });
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("contact_messages")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id),
      30000,
      "updateContactMessageStatus"
    );

    if (error) {
      console.error("[API] updateContactMessageStatus Supabase error:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("[API] updateContactMessageStatus caught error:", error);
    return { data: null, error };
  }
}

// Admin Management Functions
export async function getAllProfiles() {
  console.log("[API] getAllProfiles called");
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      30000,
      "getAllProfiles"
    );

    if (error) {
      console.error("[API] getAllProfiles Supabase error:", error);
      throw error;
    }

    console.log(`[API] getAllProfiles success: returned ${data?.length} profiles`);
    return { data: data as any[] | null, error: null };
  } catch (error) {
    console.error("[API] getAllProfiles caught error:", error);
    return { data: null, error };
  }
}

export async function updateUserAdminStatus(userId: string, isAdmin: boolean) {
  console.log("[API] updateUserAdminStatus called", { userId, isAdmin });
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("profiles")
        .update({ is_admin: isAdmin, updated_at: new Date().toISOString() })
        .eq("id", userId),
      30000,
      "updateUserAdminStatus"
    );

    if (error) {
      console.error("[API] updateUserAdminStatus Supabase error:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("[API] updateUserAdminStatus caught error:", error);
    return { data: null, error };
  }
}

export async function createProfileForUser(userId: string, email: string, fullName?: string) {
  console.log("[API] createProfileForUser called", { userId, email, fullName });
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("profiles")
        .upsert({
          id: userId,
          username: email.split("@")[0],
          full_name: fullName || null,
          is_admin: email === "korantengabrahamagyei@gmail.com", // Auto-admin for this email
          updated_at: new Date().toISOString()
        }),
      30000,
      "createProfileForUser"
    );

    if (error) {
      console.error("[API] createProfileForUser Supabase error:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("[API] createProfileForUser caught error:", error);
    return { data: null, error };
  }
}
