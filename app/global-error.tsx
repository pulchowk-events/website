"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#000", color: "#ededed", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 480, margin: "120px auto", padding: "0 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Application error</h1>
          <p style={{ fontSize: 14, color: "#a1a1a1", marginBottom: 24 }}>
            A critical error occurred. Try reloading the page.
          </p>
          {error.digest && (
            <p style={{ fontSize: 11, color: "#7d7d7d", fontFamily: "monospace", marginBottom: 16 }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              height: 40, padding: "0 16px", border: 0, borderRadius: 6,
              background: "#ededed", color: "#0a0a0a", fontWeight: 500, cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
