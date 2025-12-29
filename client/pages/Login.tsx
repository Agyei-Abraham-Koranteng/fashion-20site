import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { toast } from "sonner";

export default function Login() {
  const { login, register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const cleanEmail = email.trim().toLowerCase();
        await login(cleanEmail, password);
        // Post-login redirect is handled by the effect based on user role and any redirect param.
      } else {
        await register(email, password);
        toast.success("Registration successful! Please check your email for confirmation or login if confirmed.");
        setIsLogin(true); // Switch back to login
      }
    } catch (err: any) {
      toast.error(err.message || (isLogin ? "Login failed" : "Registration failed"));
    }
  };

  useEffect(() => {
    // Wait for auth loading to complete
    if (loading) return;

    if (user) {
      // Check for redirect param
      const redirectParam = params.get("redirect");

      if (redirectParam) {
        // Decode and navigate
        const target = decodeURIComponent(redirectParam);
        // Prevent redirect loops if target is login
        if (target !== "/login" && target !== "/") {
          navigate(target, { replace: true });
          return;
        }
      }

      // Default redirects based on role
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, navigate, params]);

  return (
    <Layout>
      <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{isLogin ? "Sign in" : "Create Account"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full">
                {isLogin ? "Sign in" : "Sign up"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </div>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg text-xs space-y-2">
                <p className="font-semibold text-muted-foreground">Admin Access:</p>
                <p className="text-muted-foreground">
                  To become an admin, sign up with an email ending in <code>@admin.com</code>
                  (e.g., <code>admin@admin.com</code>).
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
