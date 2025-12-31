import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";

// Helper to determine admin status based on configured emails or default rules
const isAdminEmail = (email: string) => {
  const e = (email || "").toLowerCase();
  const envList = (import.meta as any)?.env?.VITE_ADMIN_EMAILS as string | undefined;
  if (envList && typeof envList === "string") {
    const set = new Set(envList.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean));
    if (set.has(e)) return true;
  }
  // Auto-admin emails
  return e === "admin@example.com" ||
    e === "korantengabrahamagyei@gmail.com" ||
    e.endsWith("@admin.com");
};

export type AuthUser = {
  id: string;
  email: string;
  role?: "admin" | "customer";
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }

    // Initial session check
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const role = isAdminEmail(session.user.email || "") ? "admin" : "customer";
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            role: role,
            full_name: session.user.user_metadata?.full_name || null,
          });
        }
      } catch (err) {
        console.error("[Auth] Initial session check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[Auth] Auth state changed:", event);
        if (session?.user) {
          const role = isAdminEmail(session.user.email || "") ? "admin" : "customer";
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            role: role,
            full_name: session.user.user_metadata?.full_name || null,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    console.log("[Auth] Attempting login for:", email);
    try {
      if (supabaseConfigured) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          console.error("[Auth] Login error:", error);
          throw error;
        }
        console.log("[Auth] Login successful");
        return;
      }
      // Mock login for demo when Supabase isn't configured
      const role: AuthUser["role"] = isAdminEmail(email) ? "admin" : "customer";
      const mockUser: AuthUser = { id: "00000000-0000-0000-0000-000000000000", email, role };
      setUser(mockUser);
      localStorage.setItem("auth:user", JSON.stringify(mockUser));
    } catch (error: any) {
      console.error("[Auth] Login exception:", error);

      if (error.message?.includes("timed out") && supabaseConfigured) {
        // Attempt to diagnose connectivity
        console.log("[Auth] Diagnosing connectivity...");
        try {
          const url = (import.meta as any).env.VITE_SUPABASE_URL;
          console.log("[Auth] Pinging Supabase URL:", url);
          // Try a simple health check or just fetch the root
          const start = Date.now();
          const res = await fetch(`${url}/auth/v1/health`, { method: "GET" });
          const end = Date.now();
          console.log(`[Auth] Ping result: Status ${res.status} in ${end - start}ms`);
        } catch (pingError) {
          console.error("[Auth] Ping failed. Network might be unreachable:", pingError);
        }
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      if (supabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: undefined, // Disable email confirmation
          },
        });
        if (error) throw error;

        // Create profile with full name if user was created
        // Temporarily disabled to debug schema issues
        /*
        if (data.user && fullName) {
          try {
            await (supabase.from("profiles") as any).upsert({
              id: data.user.id,
              full_name: fullName,
              username: email.split("@")[0],
              is_admin: email === "korantengabrahamagyei@gmail.com", // Auto-admin for this email
            });
          } catch (profileError) {
            console.warn("Failed to create profile:", profileError);
            // Don't throw - registration succeeded even if profile creation failed
          }
        }
        */
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (supabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (supabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      localStorage.removeItem("auth:user");
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(() => ({ user, loading, login, register, resetPassword, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
