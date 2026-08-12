import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import axios from "axios";

const API_URL = "http://108.129.238.144:8084/api/readings";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTimestamp(ts) {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  return d.toLocaleDateString("en-IE", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Custom anomaly dot ─────────────────────────────────────────────────────

const AnomalyDot = (props) => {
  const { cx, cy, payload } = props;
  if (!payload.anomaly) return null;
  return <circle cx={cx} cy={cy} r={4} fill="#EF4444" stroke="#FCA5A5" strokeWidth={1.5} />;
};

// ── Custom tooltip ─────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: "#1E293B", border: "1px solid #334155",
      borderRadius: 8, padding: "10px 14px", fontSize: 13,
      color: "#E2E8F0", fontFamily: "Inter, sans-serif"
    }}>
      <div style={{ color: "#94A3B8", marginBottom: 4 }}>Reading #{label}</div>
      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 15, fontWeight: 600 }}>
        {payload[0].value}{unit}
      </div>
      {d.anomaly && (
        <div style={{ color: "#EF4444", marginTop: 6, fontWeight: 600, fontSize: 12 }}>
          ⚠ Anomaly flagged
        </div>
      )}
      {d.timeStamp && (
        <div style={{ color: "#64748B", marginTop: 4, fontSize: 11 }}>
          {formatTimestamp(d.timeStamp)}
        </div>
      )}
    </div>
  );
};

// ── Stat card ──────────────────────────────────────────────────────────────

const StatCard = ({ label, value, unit, accent, sub }) => (
  <div style={{
    background: "#1E293B", borderRadius: 12, padding: "20px 24px",
    border: "1px solid #334155", flex: 1,
  }}>
    <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
      {label}
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ fontSize: 32, fontWeight: 700, color: accent, fontFamily: "JetBrains Mono, monospace" }}>
        {value ?? "—"}
      </span>
      {unit && <span style={{ fontSize: 16, color: "#94A3B8" }}>{unit}</span>}
    </div>
    {sub && <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>{sub}</div>}
  </div>
);

// ── Main App ───────────────────────────────────────────────────────────────

function App() {
  const [readings, setReadings] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchReadings = async () => {
    try {
      const response = await axios.get(API_URL);
      const data = response.data.map((r, index) => ({
        id: r.id,
        temp: r.temp,
        humidity: r.humidity,
        anomaly: r.anomaly,
        timeStamp: r.timeStamp,
        time: index + 1,
      }));
      setReadings(data);
      setAnomalies(data.filter((r) => r.anomaly));
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching readings:", error);
    }
  };

  useEffect(() => {
    fetchReadings();
    const interval = setInterval(fetchReadings, 5000);
    return () => clearInterval(interval);
  }, []);

  const latest = readings[readings.length - 1];

  // Styles
  const S = {
    app: {
      minHeight: "100vh",
      background: "#0F172A",
      color: "#E2E8F0",
      fontFamily: "Inter, sans-serif",
      padding: "0 0 48px",
    },
    header: {
      background: "#0F172A",
      borderBottom: "1px solid #1E293B",
      padding: "20px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: 12,
    },
    dot: {
      width: 10, height: 10,
      borderRadius: "50%",
      background: "#06B6D4",
      boxShadow: "0 0 8px #06B6D4",
      animation: "pulse 2s infinite",
    },
    title: {
      fontSize: 20, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em",
    },
    subtitle: {
      fontSize: 13, color: "#475569",
    },
    updatedBadge: {
      fontSize: 12, color: "#475569",
    },
    body: {
      maxWidth: 1280, margin: "0 auto", padding: "32px 32px 0",
    },
    statsRow: {
      display: "flex", gap: 16, marginBottom: 32,
    },
    sectionLabel: {
      fontSize: 11, color: "#475569", textTransform: "uppercase",
      letterSpacing: "0.1em", marginBottom: 12,
    },
    chartsGrid: {
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32,
    },
    chartCard: {
      background: "#1E293B", borderRadius: 12, padding: "20px 16px 8px",
      border: "1px solid #334155",
    },
    chartTitle: {
      fontSize: 13, fontWeight: 600, color: "#94A3B8",
      marginBottom: 16, paddingLeft: 8,
    },
    tableCard: {
      background: "#1E293B", borderRadius: 12,
      border: "1px solid #334155", overflow: "hidden",
    },
    tableHeader: {
      padding: "16px 20px",
      borderBottom: "1px solid #334155",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    tableTitle: {
      fontSize: 14, fontWeight: 600, color: "#F1F5F9",
    },
    anomalyBadge: {
      background: "#7F1D1D", color: "#FCA5A5",
      borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600,
    },
    table: {
      width: "100%", borderCollapse: "collapse",
    },
    th: {
      textAlign: "left", padding: "12px 20px",
      fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em",
      borderBottom: "1px solid #334155",
    },
    td: {
      padding: "12px 20px", fontSize: 13, borderBottom: "1px solid #1E293B",
      fontFamily: "JetBrains Mono, monospace",
    },
    emptyState: {
      padding: "40px 20px", textAlign: "center",
      color: "#475569", fontSize: 14,
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0F172A; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #243147; }
      `}</style>

      <div style={S.app}>

        {/* Header */}
        <div style={S.header}>
          <div style={S.logo}>
            <div style={S.dot} />
            <div>
              <div style={S.title}>EdgeSense</div>
              <div style={S.subtitle}>Edge AI Anomaly Detection</div>
            </div>
          </div>
          <div style={S.updatedBadge}>
            {lastUpdated
              ? `Last updated ${lastUpdated.toLocaleTimeString("en-IE")}`
              : "Connecting..."}
          </div>
        </div>

        <div style={S.body}>

          {/* Stat cards */}
          <div style={S.sectionLabel}>Live Status</div>
          <div style={S.statsRow}>
            <StatCard
              label="Temperature"
              value={latest?.temp?.toFixed(1)}
              unit="°C"
              accent="#F59E0B"
              sub="Current reading"
            />
            <StatCard
              label="Humidity"
              value={latest?.humidity?.toFixed(1)}
              unit="%"
              accent="#06B6D4"
              sub="Current reading"
            />
            <StatCard
              label="Anomalies Detected"
              value={anomalies.length}
              accent="#EF4444"
              sub={`from ${readings.length} total readings`}
            />
            <StatCard
              label="Total Readings"
              value={readings.length}
              accent="#8B5CF6"
              sub={latest?.timeStamp ? formatDate(latest.timeStamp) : "—"}
            />
          </div>

          {/* Charts */}
          <div style={S.sectionLabel}>Sensor History</div>
          <div style={S.chartsGrid}>

            {/* Temperature chart */}
            <div style={S.chartCard}>
              <div style={S.chartTitle}>Temperature (°C)</div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={readings} margin={{ top: 4, right: 16, bottom: 16, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3A4A" />
                  <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
                  <Tooltip content={<CustomTooltip unit="°C" />} />
                  <Line
                    type="monotone" dataKey="temp" stroke="#F59E0B"
                    strokeWidth={2} dot={<AnomalyDot />} activeDot={{ r: 5, fill: "#F59E0B" }}
                    name="Temperature"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Humidity chart */}
            <div style={S.chartCard}>
              <div style={S.chartTitle}>Humidity (%)</div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={readings} margin={{ top: 4, right: 16, bottom: 16, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3A4A" />
                  <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
                  <Tooltip content={<CustomTooltip unit="%" />} />
                  <Line
                    type="monotone" dataKey="humidity" stroke="#06B6D4"
                    strokeWidth={2} dot={<AnomalyDot />} activeDot={{ r: 5, fill: "#06B6D4" }}
                    name="Humidity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Anomaly events table */}
          <div style={S.sectionLabel}>Anomaly Events</div>
          <div style={S.tableCard}>
            <div style={S.tableHeader}>
              <div style={S.tableTitle}>Flagged Readings</div>
              {anomalies.length > 0 && (
                <div style={S.anomalyBadge}>{anomalies.length} anomalies</div>
              )}
            </div>
            {anomalies.length > 0 ? (
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>ID</th>
                    <th style={S.th}>Temperature (°C)</th>
                    <th style={S.th}>Humidity (%)</th>
                    <th style={S.th}>Time</th>
                    <th style={S.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[...anomalies].reverse().map((a) => (
                    <tr key={a.id}>
                      <td style={{ ...S.td, color: "#475569" }}>{a.id}</td>
                      <td style={{ ...S.td, color: "#F59E0B" }}>{a.temp}</td>
                      <td style={{ ...S.td, color: "#06B6D4" }}>{a.humidity}</td>
                      <td style={{ ...S.td, color: "#E2E8F0" }}>{formatTimestamp(a.timeStamp)}</td>
                      <td style={{ ...S.td, color: "#64748B" }}>{formatDate(a.timeStamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={S.emptyState}>
                No anomalies detected — system running normally.
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default App;