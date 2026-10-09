import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function App() {
  const [chain, setChain] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [form, setForm] = useState({
    product_id: "BATCH-402",
    stage: "Shipped",
    location: "Rotterdam Port",
    actor: "DHL Express",
  });

  const loadData = async () => {
    try {
      const chainRes = await axios.get(`${API}/chain`);
      const verifyRes = await axios.get(`${API}/verify`);
      setChain(chainRes.data.chain);
      setIsValid(verifyRes.data.is_valid);
    } catch (err) {
      console.error("Backend not reachable yet", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/add-stage`, form);
    loadData();
  };

  return (
    <div style={{ maxWidth: "700px", margin: "30px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h2>📦 TraceChain Ledger</h2>

      <div style={{ padding: "10px", background: isValid ? "#e8f5e9" : "#ffebee", borderRadius: "8px", marginBottom: "20px" }}>
        <strong>Integrity Status:</strong> {isValid ? "✅ Verified & Tamper-free" : "❌ Invalid Chain!"}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "30px" }}>
        <h3>Log New Stage</h3>
        <input placeholder="Product ID" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required />
        <input placeholder="Stage (e.g. In Transit)" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} required />
        <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        <input placeholder="Actor / Company" value={form.actor} onChange={(e) => setForm({ ...form, actor: e.target.value })} required />
        <button type="submit" style={{ padding: "10px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
          Append to Blockchain
        </button>
      </form>

      <h3>Ledger Timeline ({chain.length} blocks)</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {chain.map((block) => (
          <div key={block.index} style={{ border: "1px solid #ddd", padding: "12px", borderRadius: "6px", background: "#fcfcfc" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Block #{block.index}</strong>
              <small>{new Date(block.timestamp * 1000).toLocaleTimeString()}</small>
            </div>
            <div style={{ margin: "8px 0", fontSize: "0.95rem" }}>
              {block.data.product_id ? (
                <>
                  <div><strong>Product:</strong> {block.data.product_id}</div>
                  <div><strong>Action:</strong> {block.data.stage}</div>
                  <div><strong>Location:</strong> {block.data.location} ({block.data.actor})</div>
                </>
              ) : (
                <em>{block.data.message}</em>
              )}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#666", wordBreak: "break-all" }}>
              <div><strong>Prev:</strong> {block.previous_hash}</div>
              <div><strong>Hash:</strong> {block.hash}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}