import { Link } from "react-router-dom";
import { FiSun, FiMoon, FiMonitor } from "react-icons/fi";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { useTheme, type Theme } from "@/context/ThemeContext";
import { isGmailConfigured } from "@/lib/gmail";
import { Button } from "@/components/ui/button";
import ResumeSection from "@/components/settings/ResumeSection";

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <FiSun className="h-4 w-4" /> },
  { value: "dark", label: "Dark", icon: <FiMoon className="h-4 w-4" /> },
  { value: "system", label: "System", icon: <FiMonitor className="h-4 w-4" /> },
];

function StatusPill({ ok }: { ok: boolean }) {
  return (
    <span
      className={`small-caps rounded-full px-2.5 py-1 ${
        ok
          ? "bg-status-applied/40 text-foreground"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {ok ? "Connected" : "Not set up"}
    </span>
  );
}

export default function Settings() {
  const { session, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const email = session?.user.email ?? "—";
  const gmailReady = isGmailConfigured();

  return (
    <div className="max-w-5xl space-y-12">
      <div>
        <h1 className="text-4xl font-heading leading-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Your account, appearance, and integrations.
        </p>
      </div>

      {/* Account */}
      <section>
        <div className="section-label">
          <span className="rule" />
          <span className="label">Account</span>
          <span className="rule" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="small-caps mb-1">Signed in as</p>
            <p className="text-lg font-medium">{email}</p>
          </div>
          <Button variant="outline" onClick={signOut} className="gap-2">
            <FaSignOutAlt className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </section>

      {/* Appearance */}
      <section>
        <div className="section-label">
          <span className="rule" />
          <span className="label">Appearance</span>
          <span className="rule" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-medium">Theme</p>
            <p className="text-sm text-muted-foreground">
              Choose light, dark, or follow your system.
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            {THEME_OPTIONS.map((opt) => {
              const active = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  aria-pressed={active}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors touch-manipulation ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Resume */}
      <ResumeSection />

      {/* Integrations */}
      <section>
        <div className="section-label">
          <span className="rule" />
          <span className="label">Integrations</span>
          <span className="rule" />
        </div>
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-md">
              <div className="mb-1 flex items-center gap-3">
                <p className="text-lg font-medium">Gmail Import</p>
                <StatusPill ok={gmailReady} />
              </div>
              <p className="text-sm text-muted-foreground">
                Scan your inbox to auto-import applications. Requires a Google
                OAuth client ID (<code className="font-mono text-xs">VITE_GOOGLE_CLIENT_ID</code>).
              </p>
            </div>
            <Button variant="outline" size="sm" render={<Link to="/import" />}>
              Open importer
            </Button>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4 border-t border-border pt-6">
            <div className="max-w-md">
              <div className="mb-1 flex items-center gap-3">
                <p className="text-lg font-medium">AI Features</p>
                <span className="small-caps rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                  Server-side
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Reflections and email extraction run through a Supabase Edge
                Function using your Google AI Studio (Gemini) API key. Configured
                on the server, not in the browser.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
