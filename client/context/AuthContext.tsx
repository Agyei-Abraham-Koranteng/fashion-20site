import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const supabaseConfigured = true;

// Helper to determine admin status based on configured emails or default rules
const isAdminEmail = (email: string) => {
  const e = (email || "").toLowerCase();
  const envList = (import.meta as any)?.env?.VITE_ADMIN_EMAILS as string | undefined;
  if (envList && typeof envList === "string") {
    const set = new Set(envList.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean));
    if (set.has(e)) return true;
  }
  return e === "admin@example.com" || e.endsWith("@admin.com");
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
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          if (session?.user) {
            const email = session.user.email || "";

            // Fetch profile for additional data and admin check
            const { data: profile } = await supabase
              .from("profiles")
              .select("is_admin, full_name, username, avatar_url")
              .eq("id", session.user.id)
              .maybeSingle<any>();

            const isAdmin = isAdminEmail(email) || (profile ? !!profile.is_admin : false);

            const newUser: AuthUser = {
              id: session.user.id,
              email,
              role: isAdmin ? "admin" : "customer",
              full_name: profile?.full_name || null,
              username: profile?.username || null,
              avatar_url: profile?.avatar_url || null,
            };
            setUser(newUser);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Auth sync error:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    );

    // Fallback timer to ensure loading state doesn't hang indefinitely
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (supabaseConfigured) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return;
      }
      // Mock login for demo when Supabase isn't configured
      const role: AuthUser["role"] = isAdminEmail(email) ? "admin" : "customer";
      const mockUser: AuthUser = { id: "mock-user", email, role };
      setUser(mockUser);
      localStorage.setItem("auth:user", JSON.stringify(mockUser));
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (supabaseConfigured) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
    } finally {
      setLoading(false);
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

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
