import { supabase } from "./supabaseClient";
import { Product, Category, Review, Order, Address } from "./types";

// Sample products data (for now, before Supabase is set up)
export const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Classic White T-Shirt",
    description: "Premium quality white t-shirt made from 100% organic cotton",
    price: 49.99,
    sale_price: 34.99,
    category_id: "women",
    category: {
      id: "women",
      name: "Women",
      slug: "women",
      created_at: new Date().toISOString(),
    },
    images: [
      {
        id: "img1",
        product_id: "1",
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
        alt_text: "White t-shirt front",
        order: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: "img2",
        product_id: "1",
        url: "https://images.unsplash.com/photo-1505503185646-a42bb3bcb253?w=500&h=500&fit=crop",
        alt_text: "White t-shirt back",
        order: 2,
        created_at: new Date().toISOString(),
      },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["#ffffff", "#000000", "#e8e8e8"],
    stock: 150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Designer Black Blazer",
    description: "Elegant black blazer perfect for any occasion",
    price: 199.99,
    sale_price: 149.99,
    category_id: "women",
    category: {
      id: "women",
      name: "Women",
      slug: "women",
      created_at: new Date().toISOString(),
    },
    images: [
      {
        id: "img3",
        product_id: "2",
        url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=500&fit=crop",
        alt_text: "Black blazer",
        order: 1,
        created_at: new Date().toISOString(),
      },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["#000000", "#2d2d2d"],
    stock: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Premium Denim Jeans",
    description: "High-quality denim jeans with perfect fit and comfort",
    price: 89.99,
    category_id: "women",
    category: {
      id: "women",
      name: "Women",
      slug: "women",
      created_at: new Date().toISOString(),
    },
    images: [
      {
        id: "img4",
        product_id: "3",
        url: "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop",
        alt_text: "Premium denim jeans",
        order: 1,
        created_at: new Date().toISOString(),
      },
    ],
    sizes: ["24", "25", "26", "27", "28", "29", "30", "31", "32"],
    colors: ["#1a3a52", "#4a4a4a", "#2d5a7b"],
    stock: 200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Silk Camisole",
    description: "Luxurious silk camisole for elegant styling",
    price: 79.99,
    sale_price: 59.99,
    category_id: "women",
    category: {
      id: "women",
      name: "Women",
      slug: "women",
      created_at: new Date().toISOString(),
    },
    images: [
      {
        id: "img5",
        product_id: "4",
        url: "https://images.unsplash.com/photo-1544623634-c0ee0b51e0f1?w=500&h=500&fit=crop",
        alt_text: "Silk camisole",
        order: 1,
        created_at: new Date().toISOString(),
      },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["#ff69b4", "#000000", "#ffffff"],
    stock: 80,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Mens Casual Shirt",
    description: "Comfortable and stylish casual shirt for everyday wear",
    price: 59.99,
    category_id: "men",
    category: {
      id: "men",
      name: "Men",
      slug: "men",
      created_at: new Date().toISOString(),
    },
    images: [
      {
        id: "img6",
        product_id: "5",
        url: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500&h=500&fit=crop",
        alt_text: "Casual mens shirt",
        order: 1,
        created_at: new Date().toISOString(),
      },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["#1a1a1a", "#3366cc", "#ff6b6b"],
    stock: 120,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Designer Handbag",
    description: "Premium leather handbag with elegant design",
    price: 299.99,
    sale_price: 249.99,
    category_id: "accessories",
    category: {
      id: "accessories",
      name: "Accessories",
      slug: "accessories",
      created_at: new Date().toISOString(),
    },
    images: [
      {
        id: "img7",
        product_id: "6",
        url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop",
        alt_text: "Designer handbag",
        order: 1,
        created_at: new Date().toISOString(),
      },
    ],
    sizes: ["One Size"],
    colors: ["#8B4513", "#000000", "#A0826D"],
    stock: 35,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Product queries
export async function getProducts(filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}) {
  try {
    // Return sample products for now - replace with Supabase query when backend is ready
    let products = [...sampleProducts];

    if (filters?.category) {
      products = products.filter((p) => p.category?.slug === filters.category);
    }

    if (filters?.minPrice) {
      products = products.filter(
        (p) => (p.sale_price || p.price) >= filters.minPrice!,
      );
    }

    if (filters?.maxPrice) {
      products = products.filter(
        (p) => (p.sale_price || p.price) <= filters.maxPrice!,
      );
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search),
      );
    }

    return { data: products, error: null };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { data: null, error };
  }
}

export async function getProductById(id: string) {
  try {
    // Return sample product for now
    const product = sampleProducts.find((p) => p.id === id);
    return {
      data: product,
      error: product ? null : new Error("Product not found"),
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { data: null, error };
  }
}

export async function getCategories() {
  try {
    const now = new Date().toISOString();
    const categories: Category[] = [
      { id: "women", name: "Women", slug: "women", created_at: now },
      { id: "men", name: "Men", slug: "men", created_at: now },
      {
        id: "accessories",
        name: "Accessories",
        slug: "accessories",
        created_at: now,
      },
    ];
    return { data: categories, error: null };
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
    const { data, error } = await supabase
      .from("reviews")
      .insert([{ product_id: productId, user_id: userId, ...review }])
      .select();

    return { data: data as Review[] | null, error };
  } catch (error) {
    console.error("Error creating review:", error);
    return { data: null, error };
  }
}

// Orders
export async function getOrders(userId: string) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return { data: data as Order[] | null, error };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { data: null, error };
  }
}

export async function createOrder(
  userId: string,
  order: {
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
      size: string;
      color: string;
    }>;
    shipping_address: Address;
    billing_address: Address;
  },
) {
  try {
    const totalPrice = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: userId,
          status: "pending",
          total_price: totalPrice,
          shipping_address: order.shipping_address,
          billing_address: order.billing_address,
        },
      ])
      .select();

    if (orderError || !orderData) {
      return { data: null, error: orderError };
    }

    const orderId = orderData[0].id;

    const { data: itemsData, error: itemsError } = await supabase
      .from("order_items")
      .insert(
        order.items.map((item) => ({
          order_id: orderId,
          ...item,
        })),
      )
      .select();

    return {
      data: { ...orderData[0], order_items: itemsData },
      error: itemsError,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return { data: null, error };
  }
}
