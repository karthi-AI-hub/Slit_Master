import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const { signIn, loading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error } = await signIn(email, password);
    if (error) setError(error.message || "Login failed");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef]">
      <Card className="w-full max-w-md shadow-xl border border-border/50 animate-fade-in">
        <CardHeader className="flex flex-col items-center gap-2 pb-2">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 rounded-full shadow mb-2 object-cover" />
          <CardTitle className="text-2xl font-bold text-foreground">Sign in to Slit Master</CardTitle>
          <span className="text-muted-foreground text-sm">Optimizing Paper, Maximizing Value</span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="bg-background/80"
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="bg-background/80 pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {error && <div className="text-destructive text-center text-sm font-medium rounded py-2 bg-destructive/10 border border-destructive/30">{error}</div>}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary/80 text-white font-semibold text-base py-2 rounded shadow hover:opacity-90 transition"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
