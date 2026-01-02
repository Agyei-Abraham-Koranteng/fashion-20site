import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import { updateLastLogin } from "@/lib/api";

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
          // Update last login timestamp for active customer tracking
          await updateLastLogin(session.user.id);
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
          // Update last login timestamp for active customer tracking
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await updateLastLogin(session.user.id);
          }
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
        // Step 1: Try to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });

        if (signInError) {
          // Step 2: If login fails due to invalid credentials, it might be a new user
          // Frictionless approach: Attempt to sign them up automatically
          if (signInError.message?.toLowerCase().includes("invalid login credentials")) {
            console.log("[Auth] User not found, attempting auto-registration...");
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: email.trim().toLowerCase(),
              password,
              options: {
                data: {
                  full_name: email.split("@")[0], // Default name from email
                }
              }
            });

            if (signUpError) {
              console.error("[Auth] Auto-registration failed:", signUpError);
              throw signInError; // Throw the original login error for clarity
            }

            // If auto-confirm is enabled in Supabase, they'll have a session now
            if (signUpData.session) {
              console.log("[Auth] Auto-registration successful");
              return;
            } else {
              // If no session, email confirmation is likely required
              throw new Error("Account created! Please check your email (" + email + ") to confirm your registration and continue.");
            }
          }
          throw signInError;
        }
        return;
      }

      // Mock login for demo/offline fallback if Supabase isn't configured at all
      const role: AuthUser["role"] = isAdminEmail(email) ? "admin" : "customer";
      const mockUser: AuthUser = { id: "00000000-0000-0000-0000-000000000000", email, role };
      setUser(mockUser);
      localStorage.setItem("auth:user", JSON.stringify(mockUser));
    } catch (error: any) {
      console.error("[Auth] Login exception:", error);
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
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName || email.split("@")[0],
            }
          },
        });
        if (error) throw error;

        // Create/Sync profile
        if (data.user) {
          try {
            await (supabase.from("profiles") as any).upsert({
              id: data.user.id,
              full_name: fullName || email.split("@")[0],
              username: email.split("@")[0],
              is_admin: isAdminEmail(email),
            });
          } catch (profileError) {
            console.warn("[Auth] Failed to sync profile during registration:", profileError);
          }
        }
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
