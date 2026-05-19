export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", padding: 40, textAlign: "center", display: "grid", placeItems: "center" }}>
      <div>
        <h1 style={{ fontSize: 48, marginBottom: 16 }}>404</h1>
        <p style={{ marginBottom: 24 }}>This page could not be found.</p>
        <a href="/" style={{ textDecoration: "underline" }}>Return home</a>
      </div>
    </main>
  );
}
