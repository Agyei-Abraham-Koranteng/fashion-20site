export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            products: {
                Row: {
                    id: number
                    name: string
                    description: string | null
                    price: number
                    image: string | null
                    image_url: string | null
                    category_id: string
                    stock: number
                    sizes: string[] | null
                    colors: string[] | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    description?: string | null
                    price: number
                    image?: string | null
                    image_url?: string | null
                    category_id: string
                    stock?: number
                    sizes?: string[] | null
                    colors?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    description?: string | null
                    price?: number
                    image?: string | null
                    image_url?: string | null
                    category_id?: string
                    stock?: number
                    sizes?: string[] | null
                    colors?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
            }
            orders: {
                Row: {
                    id: number
                    user_id: string
                    status: string
                    total_price: number
                    shipping_address: Json | null
                    billing_address: Json | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    user_id: string
                    status?: string
                    total_price: number
                    shipping_address?: Json | null
                    billing_address?: Json | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    status?: string
                    total_price?: number
                    shipping_address?: Json | null
                    billing_address?: Json | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            order_items: {
                Row: {
                    id: number
                    order_id: number
                    product_id: number
                    quantity: number
                    price: number
                }
                Insert: {
                    id?: number
                    order_id: number
                    product_id: number
                    quantity: number
                    price: number
                }
                Update: {
                    id?: number
                    order_id?: number
                    product_id?: number
                    quantity?: number
                    price?: number
                }
            }
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    is_admin: boolean
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    is_admin?: boolean
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    is_admin?: boolean
                    updated_at?: string | null
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    image_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    description?: string | null
                    image_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    description?: string | null
                    image_url?: string | null
                    created_at?: string
                }
            }
            reviews: {
                Row: {
                    id: number
                    product_id: number
                    user_id: string
                    rating: number
                    title: string | null
                    comment: string | null
                    helpful_count: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    product_id: number
                    user_id: string
                    rating: number
                    title?: string | null
                    comment?: string | null
                    helpful_count?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    product_id?: number
                    user_id?: string
                    rating?: number
                    title?: string | null
                    comment?: string | null
                    helpful_count?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            cms_content: {
                Row: {
                    id: number
                    key: string
                    content: Json
                    updated_at: string
                    updated_by: string | null
                }
                Insert: {
                    id?: number
                    key: string
                    content: Json
                    updated_at?: string
                    updated_by?: string | null
                }
                Update: {
                    id?: number
                    key?: string
                    content?: Json
                    updated_at?: string
                    updated_by?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
