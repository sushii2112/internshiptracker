import { Link } from "react-router-dom";
import { useEmailImport } from "@/hooks/useEmailImport";
import { isGmailConfigured } from "@/lib/gmail";
import ImportRowCard from "@/components/import/ImportRowCard";
import { Button } from "@/components/ui/button";

function SetupNotice() {
  return (
    <div className="max-w-2xl border-t border-border pt-10">
      <h2 className="text-2xl font-heading mb-4">Setup required</h2>
      <p className="text-muted-foreground leading-relaxed">
        Gmail import isn't connected yet. To enable it you'll need a Google OAuth client ID and
        the AI extraction function deployed. Once you have them:
      </p>
      <ol className="mt-4 space-y-2 text-muted-foreground leading-relaxed list-decimal pl-5">
        <li>
          Create an OAuth <span className="font-medium text-foreground">Web application</span>{" "}
          client ID in a Google Cloud project (consent screen in “testing”, with your own email as
          a test user), enable the Gmail API, and add your app URL to the authorized JavaScript
          origins.
        </li>
        <li>
          Put the client ID in a <span className="font-mono text-sm">.env</span> value named{" "}
          <span className="font-mono text-sm">VITE_GOOGLE_CLIENT_ID</span> and restart the dev
          server.
        </li>
        <li>
          Deploy the <span className="font-mono text-sm">ai-import</span> edge function (same
          <span className="font-mono text-sm"> GEMINI_API_KEY</span> secret as{" "}
          <span className="font-mono text-sm">ai-reflection</span>).
        </li>
      </ol>
    </div>
  );
}

export default function Import() {
  const {
    phase,
    rows,
    error,
    importedCount,
    scannedCount,
    connectAndScan,
    updateRow,
    commit,
    reset,
  } = useEmailImport();

  if (!isGmailConfigured()) {
    return (
      <div className="max-w-5xl space-y-12">
        <div>
          <h1 className="text-4xl font-heading leading-tight">Import from Email</h1>
          <p className="mt-2 text-muted-foreground">
            Let AI scan your inbox and turn internship emails into tracked applications.
          </p>
        </div>
        <SetupNotice />
      </div>
    );
  }

  const busy = phase === "connecting" || phase === "scanning";
  const includedCount = rows.filter((r) => r.include).length;

  return (
    <div className="max-w-5xl space-y-12">
      <div>
        <h1 className="text-4xl font-heading leading-tight">Import from Email</h1>
        <p className="mt-2 text-muted-foreground">
          Let AI scan your inbox and turn internship emails into tracked applications.
        </p>
      </div>

      {(phase === "idle" || busy) && (
        <div className="border-t border-border pt-10">
          <p className="text-muted-foreground leading-relaxed max-w-2xl mb-6">
            We'll open Google's secure sign-in, read only your recent internship-related emails,
            and let you review everything before anything is saved.
          </p>
          <Button
            onClick={connectAndScan}
            disabled={busy}
            className="h-12 rounded-md px-8 tracking-wide font-medium shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 touch-manipulation"
          >
            {phase === "connecting"
              ? "Connecting..."
              : phase === "scanning"
                ? "Scanning inbox..."
                : "Connect Gmail & Scan"}
          </Button>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        </div>
      )}

      {phase === "review" && (
        <div>
          <div className="section-label">
            <span className="rule" />
            <span className="label">
              Review — {includedCount} of {rows.length} selected
            </span>
            <span className="rule" />
          </div>

          {rows.length === 0 ? (
            <p className="text-muted-foreground italic">
              Scanned {scannedCount} email{scannedCount === 1 ? "" : "s"}, but found nothing that
              looks like an internship application.
            </p>
          ) : (
            <>
              <div className="space-y-5">
                {rows.map((row) => (
                  <ImportRowCard
                    key={row.emailId}
                    row={row}
                    onChange={(patch) => updateRow(row.emailId, patch)}
                  />
                ))}
              </div>

              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

              <div className="mt-8 flex items-center gap-4">
                <Button
                  onClick={commit}
                  disabled={includedCount === 0}
                  className="h-12 rounded-md px-8 tracking-wide font-medium shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 touch-manipulation"
                >
                  Import {includedCount} Application{includedCount === 1 ? "" : "s"}
                </Button>
                <button
                  onClick={reset}
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline touch-manipulation"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {phase === "importing" && (
        <p className="border-t border-border pt-10 text-muted-foreground">Importing...</p>
      )}

      {phase === "done" && (
        <div className="border-t border-border pt-10">
          <h2 className="text-2xl font-heading mb-3">
            Imported {importedCount} application{importedCount === 1 ? "" : "s"}.
          </h2>
          <div className="flex items-center gap-4">
            <Link to="/applications">
              <Button className="h-12 rounded-md px-8 tracking-wide font-medium shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 touch-manipulation">
                View Applications
              </Button>
            </Link>
            <button
              onClick={reset}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline touch-manipulation"
            >
              Scan again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
