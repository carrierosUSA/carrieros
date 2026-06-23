export default function Home() {
  return (
    <main style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🚛 CarrierOS Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div style={{ padding: "20px", border: "1px solid #ddd" }}>
          <h2>Revenue</h2>
          <p>$125,000</p>
        </div>

        <div style={{ padding: "20px", border: "1px solid #ddd" }}>
          <h2>Active Loads</h2>
          <p>14</p>
        </div>

        <div style={{ padding: "20px", border: "1px solid #ddd" }}>
          <h2>Trucks</h2>
          <p>8</p>
        </div>

        <div style={{ padding: "20px", border: "1px solid #ddd" }}>
          <h2>Pending Invoices</h2>
          <p>6</p>
        </div>
      </div>
    </main>
  );
}