import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

const API_BASE = "http://127.0.0.1:8000";

const LIMITS = [20, 50, 100, 200];

export default function HistoryPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    fetchHistory();
  }, [limit]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sensor/history?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch history");
      const json = await res.json();
      const formatted = json
        .reverse()
        .map((r) => ({
          ...r,
          time: new Date(r.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: new Date(r.timestamp).toLocaleDateString(),
          heart_rate: parseFloat(r.heart_rate.toFixed(1)),
          spo2: parseFloat(r.spo2.toFixed(1)),
          temperature: parseFloat(r.temperature.toFixed(1)),
        }));
      setData(formatted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = (key) => {
    if (!data.length) return { min: "--", max: "--", avg: "--" };
    const vals = data.map((d) => d[key]);
    return {
      min: Math.min(...vals).toFixed(1),
      max: Math.max(...vals).toFixed(1),
      avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
    };
  };

  const charts = [
    {
      key: "heart_rate",
      label: "Heart rate",
      unit: "BPM",
      color: "#E24B4A",
      domain: [40, 160],
    },
    {
      key: "spo2",
      label: "SpO₂",
      unit: "%",
      color: "#378ADD",
      domain: [85, 100],
    },
    {
      key: "temperature",
      label: "Temperature",
      unit: "°C",
      color: "#EF9F27",
      domain: [35, 40],
    },
  ];

  return (
    <Layout>
    <div style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)" }}>
            Vitals history
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--color-text-secondary)" }}>
            {data.length} readings loaded
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Show last</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{ fontSize: 13, padding: "4px 8px", borderRadius: 8 }}
          >
            {LIMITS.map((l) => (
              <option key={l} value={l}>{l} readings</option>
            ))}
          </select>
          <button onClick={fetchHistory} style={{ fontSize: 13, padding: "4px 12px" }}>
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "var(--color-background-danger)", color: "var(--color-text-danger)", padding: "12px 16px", borderRadius: 8, marginBottom: "1.5rem", fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)", fontSize: 14 }}>
          Loading...
        </div>
      )}

      {/* Charts */}
      {!loading && data.length > 0 && charts.map((chart) => {
        const s = stats(chart.key);
        return (
          <div
            key={chart.key}
            style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: 12,
              padding: "1.25rem",
              marginBottom: "1.25rem",
            }}
          >
            {/* Chart header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
                  {chart.label}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-text-secondary)" }}>
                  {chart.unit}
                </p>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {[["Min", s.min], ["Avg", s.avg], ["Max", s.max]].map(([label, val]) => (
                  <div key={label} style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-tertiary)" }}>{label}</p>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>
                      {val} <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{chart.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Line chart */}
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={chart.domain}
                  tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-secondary)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(val) => [`${val} ${chart.unit}`, chart.label]}
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.date
                      ? `${payload[0].payload.date} ${label}`
                      : label
                  }
                />
                <Line
                  type="monotone"
                  dataKey={chart.key}
                  stroke={chart.color}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}

      {/* Empty state */}
      {!loading && data.length === 0 && !error && (
        <div style={{
          textAlign: "center", padding: "4rem",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 12, color: "var(--color-text-secondary)", fontSize: 14
        }}>
          No history data found. Start the simulation to record vitals.
        </div>
      )}
    </div>
    </Layout>
  );
}