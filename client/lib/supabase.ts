import { createClient } from "@supabase/supabase-js";
import { Database } from "@shared/schema";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase credentials");
}

export const supabase = createClient<Database>(
    supabaseUrl || "",
    supabaseAnonKey || ""
);
