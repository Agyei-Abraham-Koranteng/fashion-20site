export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  category_id: string;
  category?: Category;
  images: ProductImage[];
  sizes: string[];
  colors: string[];
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  order: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface WishlistItem {
  product_id: string;
  product: Product;
  added_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  helpful_count: number;
  user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total_price: number;
  shipping_address: Address | any;
  billing_address: Address | any;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  price: number;
  size: string;
  color: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}
