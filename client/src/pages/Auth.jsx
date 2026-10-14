import { useState } from "react";
<<<<<<< HEAD
import { useAuth } from "@/lib/auth";
=======
import { useAuth } from "@/AuthContext";
>>>>>>> 3f8021b6a239b887bd48f7170589b29b907ef28d
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const friendly = (e) => {
  const c = e.code || "";
  if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found")) return "Incorrect email or password.";
  if (c.includes("email-already-in-use")) return "That email is already registered. Try signing in.";
  if (c.includes("weak-password")) return "Password must be at least 6 characters.";
  if (c.includes("invalid-email")) return "Please enter a valid email.";
  if (c.includes("popup-closed")) return "Google sign-in was cancelled.";
  return e.message;
};

export default function Auth() {
  const { loginEmail, loginGoogle, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isLogin = mode === "login";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isLogin) {
      if (!form.name.trim()) return setError("Please enter your name.");
      if (form.password !== form.confirm) return setError("Passwords do not match.");
    }
    setBusy(true);
    try {
      if (isLogin) await loginEmail(form.email, form.password);
      else await register(form.name.trim(), form.email, form.password);
    } catch (err) {
      setError(friendly(err));
    }
    setBusy(false);
  };

  const google = async () => {
    setError("");
    try { await loginGoogle(); } catch (err) { setError(friendly(err)); }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background p-5">
      <Card className="w-full max-w-sm rounded-2xl border-0 shadow-2xl shadow-primary/20">
        <CardHeader className="items-center space-y-3 pb-4 pt-7">
          <Logo size={46} dark />
          <CardTitle className="text-center text-base text-foreground">
            {isLogin ? "Sign in to your CuccuPOS account" : "Create your CuccuPOS account"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-7">
          <form onSubmit={submit} className="grid gap-4">
            {!isLogin && (
              <div className="grid gap-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.name} onChange={set("name")} placeholder="Juan Dela Cruz" required className="bg-background" />
              </div>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" required className="bg-background" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={set("password")} minLength={6} required className="bg-background" />
            </div>
            {!isLogin && (
              <div className="grid gap-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" value={form.confirm} onChange={set("confirm")} required className="bg-background" />
              </div>
            )}
            {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            <Button type="submit" disabled={busy} className="w-full uppercase tracking-wide">
              {busy ? "Please wait…" : isLogin ? "Sign in" : "Register"}
            </Button>
            <div className="relative text-center text-xs text-muted-foreground">
              <div className="absolute inset-x-0 top-1/2 border-t" />
              <span className="relative bg-card px-3">or</span>
            </div>
            <Button type="button" variant="outline" onClick={google} className="w-full">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
              Continue with Google
            </Button>
            <p className="text-center text-sm">
              {isLogin ? "New here?" : "Already have an account?"}{" "}
              <button type="button" className="font-bold text-primary hover:underline" onClick={() => { setError(""); setMode(isLogin ? "register" : "login"); }}>
                {isLogin ? "Create an account" : "Sign in"}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
