import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function AdminLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin";
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome back" });
    } catch (err) {
      toast({ title: "Login failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (user === undefined) {
    return <div className="flex min-h-screen items-center justify-center">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-5 rounded-2xl bg-card p-8 shadow-elevated">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-sm text-muted-foreground">Sign in to manage the site.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    );
  }

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="container relative flex h-20 items-center justify-center">
          <Link
            to="/secret-admin"
            className="text-3xl font-extrabold tracking-widest text-black dark:text-white"
            style={{ textShadow: "0 0 12px hsl(0 90% 50% / 0.85), 0 0 24px hsl(0 90% 45% / 0.6)" }}
          >
            ADMIN
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0"
            onClick={async () => {
              await signOut(auth);
              navigate("/secret-admin");
            }}
          >
            Sign out
          </Button>
        </div>
        <nav className="container flex items-center justify-center gap-2 pb-3">
          <NavLink to="/secret-admin" end className={linkCls}>Dashboard</NavLink>
          <NavLink to="/secret-admin/posts" className={linkCls}>Posts</NavLink>
          <NavLink to="/secret-admin/ads" className={linkCls}>Ads</NavLink>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
