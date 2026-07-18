import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "signin" | "signup";

export default function Login() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setSubmitting(false);
    if (error) setError(error.message);
    // On success the auth listener updates the session and the app re-renders.
  }

  async function signInWithGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-heading text-4xl tracking-tight text-foreground">OfferFlow</h1>
          <p className="mt-3 text-muted-foreground">
            {mode === "signup" ? "Create an account to get started." : "Sign in to track your internship search."}
          </p>
        </div>

        <div className="space-y-5">
          <Button
            type="button"
            variant="outline"
            onClick={signInWithGoogle}
            className="h-12 w-full gap-3 rounded-md text-base font-medium touch-manipulation"
          >
            <FcGoogle className="h-5 w-5" />
            Continue with Google
          </Button>

          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="small-caps">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="small-caps block mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="small-caps block mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-colors"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-md tracking-wide font-medium shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 touch-manipulation"
            >
              {submitting
                ? mode === "signup"
                  ? "Creating account..."
                  : "Signing in..."
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
            </Button>
          </form>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setError(null);
              }}
              className="text-primary underline-offset-4 hover:underline touch-manipulation"
            >
              {mode === "signup" ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
