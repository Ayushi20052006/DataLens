import { useState, useCallback } from "react";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";

const API = "http://localhost:8000";
const PALETTE = ["#0F4C81", "#2E86AB", "#A8DADC", "#457B9D", "#1D3557", "#6B9080"];

/* ── tiny design tokens ── */
const T = {
  bg:       "#F7F8FA",
  surface:  "#FFFFFF",
  border:   "#E4E7EC",
  text:     "#0D1B2A",
  muted:    "#6B7280",
  accent:   "#0F4C81",
  accentLt: "#EBF2FB",
  success:  "#166534",
  successLt:"#F0FDF4",
  danger:   "#991B1B",
  dangerLt: "#FEF2F2",
  warn:     "#92400E",
  warnLt:   "#FFFBEB",
  radius:   "10px",
  radiusLg: "16px",
  shadow:   "0 1px 4px rgba(0,0,0,0.07)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.09)",
};

/* ── reusable micro-components ── */
const Card = ({ children, style = {} }) => (
  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: "1.25rem 1.5rem", boxShadow: T.shadow, ...style }}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "1.75rem 0 0.85rem" }}>
    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.muted, fontFamily: "'DM Mono', monospace" }}>{children}</span>
    <div style={{ flex: 1, height: 1, background: T.border }} />
  </div>
);

const Badge = ({ children, color = T.accent, bg = T.accentLt }) => (
  <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 9px", borderRadius: 99, background: bg, color, fontFamily: "'DM Mono', monospace" }}>{children}</span>
);

const ChipBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer",
    fontFamily: "'DM Mono', monospace", transition: "all 0.15s",
    border: `1px solid ${active ? T.accent : T.border}`,
    background: active ? T.accent : T.surface,
    color: active ? "#fff" : T.muted,
  }}>{children}</button>
);

const StatCard = ({ label, value, sub, accent = false }) => (
  <div style={{
    background: accent ? T.accent : T.surface,
    border: `1px solid ${accent ? T.accent : T.border}`,
    borderRadius: T.radius, padding: "1rem 1.25rem", boxShadow: T.shadow,
  }}>
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: accent ? "rgba(255,255,255,0.7)" : T.muted, marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: accent ? "#fff" : T.text, lineHeight: 1, letterSpacing: "-0.03em" }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: accent ? "rgba(255,255,255,0.6)" : T.muted, marginTop: 5 }}>{sub}</div>}
  </div>
);

/* ── custom tooltip for charts ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 14px", boxShadow: T.shadowMd, fontSize: 12 }}>
      <div style={{ color: T.muted, marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}</div>
      ))}
    </div>
  );
};

/* ── drag-and-drop upload zone ── */
const UploadZone = ({ onFile, filename, loading }) => {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? T.accent : T.border}`,
        borderRadius: T.radiusLg, padding: "3rem 2rem", textAlign: "center",
        background: dragging ? T.accentLt : T.surface,
        transition: "all 0.2s", cursor: "pointer", marginBottom: "1.5rem",
        boxShadow: dragging ? `0 0 0 4px ${T.accentLt}` : T.shadow,
      }}
      onClick={() => document.getElementById("fileInput").click()}
    >
      <input id="fileInput" type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }}
        onChange={e => e.target.files[0] && onFile(e.target.files[0])} />

      {/* icon */}
      <div style={{ width: 52, height: 52, borderRadius: 14, background: T.accentLt, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.8">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>

      {loading ? (
        <div style={{ color: T.accent, fontWeight: 600, fontSize: 15 }}>Analyzing dataset…</div>
      ) : filename ? (
        <>
          <div style={{ fontWeight: 600, fontSize: 15, color: T.text, marginBottom: 4 }}>✓ {filename}</div>
          <div style={{ fontSize: 12, color: T.muted }}>Click or drop another file to replace</div>
        </>
      ) : (
        <>
          <div style={{ fontWeight: 600, fontSize: 15, color: T.text, marginBottom: 6 }}>Drop your dataset here</div>
          <div style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>Supports .csv · .xlsx · .xls</div>
          <div style={{ display: "inline-block", padding: "7px 20px", background: T.accent, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
            Browse file
          </div>
        </>
      )}
    </div>
  );
};

/* ── SQL console ── */
const SqlConsole = ({ onRun, result }) => {
  const [sql, setSql] = useState("SELECT * FROM dataset LIMIT 10");
  const presets = [
    { label: "preview", sql: "SELECT * FROM dataset LIMIT 10" },
    { label: "row count", sql: "SELECT COUNT(*) as total_rows FROM dataset" },
    { label: "group by col1", sql: "SELECT {col1}, COUNT(*) as count FROM dataset GROUP BY {col1} ORDER BY count DESC LIMIT 10" },
    { label: "null check", sql: "SELECT COUNT(*) as total, COUNT({col1}) as non_null FROM dataset" },
  ];

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
          <span style={{ fontWeight: 600, fontSize: 13, color: T.text }}>SQL Console</span>
        </div>
        <Badge>SQLite in-memory</Badge>
      </div>

      {/* preset buttons */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {presets.map(p => (
          <button key={p.label} onClick={() => setSql(p.sql)} style={{
            fontSize: 11, padding: "3px 10px", borderRadius: 6, border: `1px solid ${T.border}`,
            background: T.bg, color: T.muted, cursor: "pointer", fontFamily: "'DM Mono', monospace"
          }}>{p.label}</button>
        ))}
      </div>

      <textarea value={sql} onChange={e => setSql(e.target.value)} rows={4} style={{
        width: "100%", fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "12px 14px",
        border: `1px solid ${T.border}`, borderRadius: 8, background: T.bg,
        color: T.text, boxSizing: "border-box", resize: "vertical", outline: "none",
        lineHeight: 1.6,
      }} />

      <button onClick={() => onRun(sql)} style={{
        marginTop: 10, padding: "8px 22px", background: T.accent, color: "#fff",
        border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Run Query
      </button>

      {result?.error && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: T.dangerLt, border: `1px solid #FECACA`, borderRadius: 8, fontSize: 13, color: T.danger, fontFamily: "'DM Mono', monospace" }}>
          {result.error}
        </div>
      )}

      {result?.rows && (
        <div style={{ marginTop: 14, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "auto", maxHeight: 280 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.bg, position: "sticky", top: 0 }}>
                {result.columns.map(c => (
                  <th key={c} style={{ padding: "8px 14px", textAlign: "left", fontWeight: 600, color: T.muted, fontSize: 10, borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? T.surface : T.bg }}>
                  {result.columns.map(c => (
                    <td key={c} style={{ padding: "7px 14px", fontFamily: "'DM Mono', monospace", color: T.text, whiteSpace: "nowrap" }}>{String(row[c])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

/* ════════════════════════════════
   MAIN APP
════════════════════════════════ */
export default function App() {
  const [data, setData]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [filename, setFilename]   = useState("");
  const [queryResult, setQResult] = useState(null);
  const [activeChart, setChart]   = useState("bar");
  const [error, setError]         = useState("");
  const [activeNav, setNav]       = useState("overview");

  /* ── file upload handler ── */
  async function handleFile(file) {
    setFilename(file.name);
    setLoading(true);
    setError("");
    setData(null);
    setPreview(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const [res, prev] = await Promise.all([
        axios.post(`${API}/upload`, fd),
        axios.post(`${API}/upload`, fd).then(() => axios.get(`${API}/preview`))
      ]);
      setData(res.data);
      setPreview(prev.data);
    } catch {
      setError("Upload failed — make sure the backend is running on port 8000.");
    }
    setLoading(false);
  }

  /* ── sql query handler ── */
  async function handleQuery(sql) {
    setError("");
    try {
      const res = await axios.post(`${API}/query`, { sql });
      setQResult(res.data);
    } catch {
      setQResult({ error: "Query failed. Check syntax or ensure dataset is loaded." });
    }
  }

  /* ── build chart data from preview rows ── */
  function buildChartData() {
    if (!preview?.rows || !data) return [];
    const numCol = data.columns.find(c => ["float64","int64"].includes(data.dtypes[c]));
    const lblCol = data.columns.find(c => data.dtypes[c] === "object") || data.columns[0];
    if (!numCol) return [];
    return preview.rows.slice(0, 10).map(r => ({
      name: String(r[lblCol] || "").slice(0, 12),
      value: parseFloat(r[numCol]) || 0,
      ...(data.columns.filter(c => ["float64","int64"].includes(data.dtypes[c])).slice(0,3).reduce((acc, c) => ({ ...acc, [c]: parseFloat(r[c]) || 0 }), {}))
    }));
  }

  const chartData   = buildChartData();
  const numericCols = data ? data.columns.filter(c => ["float64","int64"].includes(data.dtypes[c])) : [];
  const totalNulls  = data ? Object.values(data.nulls).reduce((a, b) => a + b, 0) : 0;
  const qualityPct  = data ? Math.round(((data.shape.rows * data.shape.cols - totalNulls) / (data.shape.rows * data.shape.cols)) * 100) : 0;

  const navItems = [
    { id: "overview",  label: "Overview" },
    { id: "charts",    label: "Charts" },
    { id: "columns",   label: "Columns" },
    { id: "sql",       label: "SQL" },
    { id: "preview",   label: "Data" },
  ];

  /* ── type badge colors ── */
  function typeMeta(dtype) {
    if (dtype?.includes("int") || dtype?.includes("float")) return { bg: T.accentLt, color: T.accent, label: "numeric" };
    if (dtype === "object") return { bg: "#F3E8FF", color: "#6D28D9", label: "text" };
    if (dtype?.includes("date") || dtype?.includes("time")) return { bg: T.warnLt, color: T.warn, label: "datetime" };
    return { bg: T.bg, color: T.muted, label: dtype };
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Outfit', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ── top nav bar ── */}
      <header style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 0 rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: T.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="9" width="3" height="6" rx="1" fill="#fff"/>
              <rect x="6" y="5" width="3" height="10" rx="1" fill="rgba(255,255,255,0.7)"/>
              <rect x="11" y="1" width="3" height="14" rx="1" fill="rgba(255,255,255,0.5)"/>
            </svg>
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: 15, color: T.text, letterSpacing: "-0.02em" }}>DataLens</span>
          </div>
        </div>

        {data && (
          <nav style={{ display: "flex", gap: 2 }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => setNav(n.id)} style={{
                padding: "5px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                border: "none", cursor: "pointer", transition: "all 0.15s",
                background: activeNav === n.id ? T.accentLt : "transparent",
                color: activeNav === n.id ? T.accent : T.muted,
              }}>{n.label}</button>
            ))}
          </nav>
        )}

        <div style={{ display: "flex", gap: 6 }}>
          <Badge color={T.success} bg={T.successLt}>Python · Pandas</Badge>
          <Badge color="#6D28D9" bg="#F3E8FF">React</Badge>
          <Badge>SQL</Badge>
        </div>
      </header>

      {/* ── main content ── */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* page title */}
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: T.text, margin: 0, letterSpacing: "-0.03em" }}>Dataset Analysis Dashboard</h1>
          <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0" }}>Upload a CSV or Excel file for instant statistical analysis, visualizations, and SQL querying.</p>
        </div>

        {/* error banner */}
        {error && (
          <div style={{ padding: "10px 16px", background: T.dangerLt, border: `1px solid #FECACA`, borderRadius: 8, fontSize: 13, color: T.danger, marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {/* upload */}
        <UploadZone onFile={handleFile} filename={filename} loading={loading} />

        {/* ── post-upload dashboard ── */}
        {data && (
          <>
            {/* OVERVIEW */}
            {activeNav === "overview" && (
              <>
                <SectionLabel>Summary statistics</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                  <StatCard label="Total rows"     value={data.shape.rows.toLocaleString()} sub="records loaded" accent />
                  <StatCard label="Columns"        value={data.shape.cols} sub="fields detected" />
                  <StatCard label="Numeric cols"   value={numericCols.length} sub="for charting" />
                  <StatCard label="Text cols"      value={data.columns.filter(c => data.dtypes[c] === "object").length} sub="categorical" />
                  <StatCard label="Null values"    value={totalNulls} sub="across all cols" />
                  <StatCard label="Data quality"   value={qualityPct + "%"} sub="completeness" />
                </div>

                <SectionLabel>Quick chart preview</SectionLabel>
                <Card>
                  <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                    {["bar","area","line"].map(t => <ChipBtn key={t} active={activeChart===t} onClick={() => setChart(t)}>{t}</ChipBtn>)}
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    {activeChart === "bar" ? (
                      <BarChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: T.muted, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        {numericCols.slice(0, 3).map((c, i) => (
                          <Bar key={c} dataKey={c} fill={PALETTE[i]} radius={[4, 4, 0, 0]} maxBarSize={40} />
                        ))}
                      </BarChart>
                    ) : activeChart === "area" ? (
                      <AreaChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                        <defs>
                          {numericCols.slice(0, 3).map((c, i) => (
                            <linearGradient key={c} id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={PALETTE[i]} stopOpacity={0.2} />
                              <stop offset="95%" stopColor={PALETTE[i]} stopOpacity={0} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: T.muted, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        {numericCols.slice(0, 3).map((c, i) => (
                          <Area key={c} type="monotone" dataKey={c} stroke={PALETTE[i]} strokeWidth={2} fill={`url(#g${i})`} />
                        ))}
                      </AreaChart>
                    ) : (
                      <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: T.muted, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        {numericCols.slice(0, 3).map((c, i) => (
                          <Line key={c} type="monotone" dataKey={c} stroke={PALETTE[i]} strokeWidth={2} dot={{ r: 3 }} />
                        ))}
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </Card>
              </>
            )}

            {/* CHARTS */}
            {activeNav === "charts" && (
              <>
                <SectionLabel>All visualizations</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {/* bar */}
                  <Card>
                    <div style={{ fontWeight: 600, fontSize: 13, color: T.text, marginBottom: 12 }}>Bar — top 10 rows</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey={numericCols[0]} fill={PALETTE[0]} radius={[3, 3, 0, 0]} maxBarSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                  {/* line */}
                  <Card>
                    <div style={{ fontWeight: 600, fontSize: 13, color: T.text, marginBottom: 12 }}>Line — trend</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey={numericCols[0]} stroke={PALETTE[1]} strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                  {/* pie */}
                  <Card>
                    <div style={{ fontWeight: 600, fontSize: 13, color: T.text, marginBottom: 12 }}>Pie — category split</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={chartData.slice(0, 6)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                          {chartData.slice(0, 6).map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                  {/* area */}
                  <Card>
                    <div style={{ fontWeight: 600, fontSize: 13, color: T.text, marginBottom: 12 }}>Area — distribution</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={PALETTE[0]} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={PALETTE[0]} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey={numericCols[0] || "value"} stroke={PALETTE[0]} strokeWidth={2} fill="url(#areaGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              </>
            )}

            {/* COLUMNS */}
            {activeNav === "columns" && (
              <>
                <SectionLabel>Column schema</SectionLabel>
                <div style={{ border: `1px solid ${T.border}`, borderRadius: T.radiusLg, overflow: "hidden", background: T.surface, boxShadow: T.shadow }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: T.bg }}>
                        {["#","Column","Type","Unique values","Null count","Null %","Health"].map(h => (
                          <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, color: T.muted, fontSize: 10, borderBottom: `1px solid ${T.border}`, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.columns.map((col, idx) => {
                        const tm = typeMeta(data.dtypes[col]);
                        const nullPct = data.null_percent[col];
                        const health = nullPct > 20 ? { color: T.danger, bg: T.dangerLt, label: "poor" }
                                     : nullPct > 5  ? { color: T.warn,   bg: T.warnLt,   label: "fair" }
                                     :                { color: T.success, bg: T.successLt, label: "good" };
                        return (
                          <tr key={col} style={{ borderBottom: `1px solid ${T.border}` }}>
                            <td style={{ padding: "10px 14px", color: T.muted, fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{idx + 1}</td>
                            <td style={{ padding: "10px 14px", fontWeight: 600, color: T.text }}>{col}</td>
                            <td style={{ padding: "10px 14px" }}><Badge color={tm.color} bg={tm.bg}>{tm.label}</Badge></td>
                            <td style={{ padding: "10px 14px", color: T.text, fontFamily: "'DM Mono', monospace" }}>{data.unique_counts[col]?.toLocaleString()}</td>
                            <td style={{ padding: "10px 14px", color: T.text, fontFamily: "'DM Mono', monospace" }}>{data.nulls[col]}</td>
                            <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ flex: 1, height: 4, background: T.border, borderRadius: 99, maxWidth: 64 }}>
                                  <div style={{ width: `${Math.min(nullPct, 100)}%`, height: "100%", borderRadius: 99, background: health.color }} />
                                </div>
                                <span style={{ fontSize: 11, color: T.muted }}>{nullPct}%</span>
                              </div>
                            </td>
                            <td style={{ padding: "10px 14px" }}><Badge color={health.color} bg={health.bg}>{health.label}</Badge></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* SQL */}
            {activeNav === "sql" && (
              <>
                <SectionLabel>SQL query console</SectionLabel>
                <SqlConsole onRun={handleQuery} result={queryResult} />
              </>
            )}

            {/* DATA PREVIEW */}
            {activeNav === "preview" && preview && (
              <>
                <SectionLabel>Raw data — first 10 rows</SectionLabel>
                <div style={{ border: `1px solid ${T.border}`, borderRadius: T.radiusLg, overflow: "auto", background: T.surface, boxShadow: T.shadow }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 600 }}>
                    <thead>
                      <tr style={{ background: T.bg }}>
                        <th style={{ padding: "8px 14px", textAlign: "left", fontWeight: 600, color: T.muted, fontSize: 10, borderBottom: `1px solid ${T.border}`, fontFamily: "'DM Mono', monospace" }}>#</th>
                        {preview.columns.map(c => (
                          <th key={c} style={{ padding: "8px 14px", textAlign: "left", fontWeight: 600, color: T.muted, fontSize: 10, borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? T.surface : T.bg }}>
                          <td style={{ padding: "8px 14px", color: T.muted, fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{i + 1}</td>
                          {preview.columns.map(c => (
                            <td key={c} style={{ padding: "8px 14px", fontFamily: "'DM Mono', monospace", color: T.text, whiteSpace: "nowrap" }}>{String(row[c])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          </>
        )}

        {/* footer */}
        <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, color: T.muted }}>DataLens </span>
          <div style={{ display: "flex", gap: 8 }}>
            {["React", "FastAPI", "Pandas", "Recharts", "SQLite"].map(t => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}