import { useState, useEffect, useRef } from "react";
import { Button } from "@mui/material";
import Layout from "../components/layout/Layout";
import { useAlert } from "../context/AlertContext";
import API from "../services/api";

/* ─────────────────────────────────────────────
   3D HEART ORB
───────────────────────────────────────────── */
function HeartOrb({ live, size = 148 }) {
  const h = Math.round(size * 0.92);
  return (
    <div style={{ position:"relative", width:size, height:h, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      {/* Outer pulsing halo */}
      <div style={{
        position:"absolute", inset:-32, borderRadius:"40% 40% 48% 48%",
        background:"radial-gradient(ellipse, rgba(192,132,252,0.22) 0%, rgba(147,51,234,0.1) 50%, transparent 72%)",
        animation:"pulseGlow 2.4s ease-in-out infinite",
        animationPlayState: live ? "running" : "paused"
      }} />
      <svg
        width={size} height={h}
        viewBox="0 0 100 90"
        style={{
          filter:
            "drop-shadow(0 0 16px rgba(232,121,249,0.65))" +
            " drop-shadow(0 0 48px rgba(147,51,234,0.4))",
          overflow: "visible", position: "relative", zIndex: 1
        }}
      >
        <defs>
          <radialGradient id="hg" cx="34%" cy="27%" r="72%">
            <stop offset="0%"   stopColor="#e879f9" />   {/* bright magenta gloss */}
            <stop offset="14%"  stopColor="#a855f7" />
            <stop offset="38%"  stopColor="#581c87" />
            <stop offset="65%"  stopColor="#2e0a52" />
            <stop offset="100%" stopColor="#0d0018" />   {/* near-black edge */}
          </radialGradient>
          <filter id="gls">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <clipPath id="hc">
            <path d="M50 82 C22 62 2 48 2 28 C2 13 12 4 26 4 C36 4 44 10 50 18 C56 10 64 4 74 4 C88 4 98 13 98 28 C98 48 78 62 50 82 Z"/>
          </clipPath>
        </defs>
        {/* Heart body — dark with bright gloss at top-left */}
        <path
          d="M50 82 C22 62 2 48 2 28 C2 13 12 4 26 4 C36 4 44 10 50 18 C56 10 64 4 74 4 C88 4 98 13 98 28 C98 48 78 62 50 82 Z"
          fill="url(#hg)"
        />
        {/* Gloss highlight */}
        <ellipse cx="34" cy="22" rx="18" ry="11"
          fill="rgba(255,255,255,0.28)" filter="url(#gls)" clipPath="url(#hc)" />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   METRIC CARD  (top-right 2×2)
───────────────────────────────────────────── */
function MetricCard({ label, value, unit, icon, danger, warning }) {
  const col = danger ? "#f87171" : warning ? "#fbbf24" : "#f8fafc";
  return (
    <div style={{ ...CARD, padding:"16px 18px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={T.label}>{label}</span>
        <span style={{ fontSize:18 }}>{icon}</span>
      </div>
      <p style={{ margin:"8px 0 0", fontSize:30, fontWeight:700, color:col, lineHeight:1 }}>
        {value}
        {unit && <span style={{ fontSize:13, fontWeight:500, color:"#64748b", marginLeft:4 }}>{unit}</span>}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECONDARY VITAL MINI-CARD  (side by side)
───────────────────────────────────────────── */
function VitalMini({ label, value, unit, sub }) {
  return (
    <div style={{ flex:1, background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"12px 14px", border:"1px solid rgba(255,255,255,0.06)" }}>
      <p style={{ margin:0, ...T.label }}>{label}</p>
      <p style={{ margin:"6px 0 0", fontSize:22, fontWeight:700, color:"#f8fafc", lineHeight:1 }}>
        {value}
        {unit && <span style={{ fontSize:12, color:"#64748b", marginLeft:3 }}>{unit}</span>}
      </p>
      {sub && <p style={{ margin:"4px 0 0", fontSize:11, color:"#475569" }}>{sub}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────── */
export default function Dashboard() {
  const { showAlert } = useAlert();

  const [sensor,     setSensor]     = useState(null);
  const [profile,    setProfile]    = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [isLive,     setIsLive]     = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [userName,   setUserName]   = useState("there");
  const [clockTime,  setClockTime]  = useState("");

  const pollRef = useRef(null);
  const simRef  = useRef(null);

  // User name from localStorage
  useEffect(() => {
    const info = JSON.parse(localStorage.getItem("userInfo") || "{}");
    if (info.first_name) setUserName(info.first_name);
  }, []);

  // Fetch health profile (for pulse pressure)
  useEffect(() => {
    API.get("/profile/").then(res => {
      if (res.data?.type === "health") setProfile(res.data.data);
    }).catch(() => {});
  }, []);

  // Poll sensor data every 2.5 s
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await API.get("/sensor/latest");
        if (res.data && Object.keys(res.data).length > 0) { setSensor(res.data); setIsLive(true); }
      } catch { setIsLive(false); }
    };
    poll();
    pollRef.current = setInterval(poll, 2500);
    return () => clearInterval(pollRef.current);
  }, []);

  // Live IST clock — ticks every second
  useEffect(() => {
    const tick = () => setClockTime(
      new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit" })
    );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Cleanup simulation interval on unmount
  useEffect(() => () => clearInterval(simRef.current), []);

  /* ── Simulation toggle ── */
  const sendReading = async () => {
    try {
      await API.post("/sensor/", {
        heart_rate:  60  + Math.random() * 60,
        hrv:         30  + Math.random() * 50,
        spo2:        94  + Math.random() * 6,
        temperature: 36  + Math.random() * 1.8,
        steps:       Math.floor(Math.random() * 10000),
        timestamp:   new Date().toISOString()
      });
    } catch (e) { showAlert(e.response?.data?.detail || "Simulation failed", "error"); }
  };

  const toggleSimulation = () => {
    if (simulating) {
      clearInterval(simRef.current);
      setSimulating(false);
    } else {
      sendReading();
      simRef.current = setInterval(sendReading, 2000);
      setSimulating(true);
    }
  };

  /* ── Prediction ── */
  const predict = async () => {
    setPredicting(true);
    try {
      const res = await API.get("/predict/");
      setPrediction(res.data);
    } catch (e) {
      showAlert(
        e.response?.status === 404
          ? "Complete your health profile first."
          : (e.response?.data?.detail || "Prediction failed"),
        "warning"
      );
    } finally { setPredicting(false); }
  };

  /* ── Derived display values ── */
  const d   = sensor;
  const hr  = d ? Math.round(d.heart_rate)         : "--";
  const hrv = d ? Math.round(d.hrv)                : "--";
  const spo2 = d ? Number(d.spo2).toFixed(1)       : "--";
  const tmp  = d ? Number(d.temperature).toFixed(1) : "--";
  const steps = d ? Number(d.steps).toLocaleString() : "--";

  const tmpDiffRaw    = d ? (d.temperature - 37.0) : null;
  const tmpDiff       = tmpDiffRaw !== null ? (tmpDiffRaw >= 0 ? `+${tmpDiffRaw.toFixed(1)}` : tmpDiffRaw.toFixed(1)) : "--";
  const pulsePressure = profile?.systolic_bp && profile?.diastolic_bp
    ? profile.systolic_bp - profile.diastolic_bp : null;

  /* ── Status flags ── */
  const hrDanger   = d && (d.heart_rate > 100 || d.heart_rate < 60);
  const spo2Danger = d && d.spo2 < 94;
  const tmpWarning = d && (d.temperature > 37.8 || d.temperature < 36.0);

  /* ── Alert generation (threshold + backend) ── */
  const alerts = [];
  if (d) {
    if (d.heart_rate > 100)      alerts.push({ msg: "High heart rate",         type: "danger"  });
    else if (d.heart_rate < 60)  alerts.push({ msg: "Low heart rate",          type: "warning" });
    if (d.spo2 < 94)             alerts.push({ msg: "Low SpO₂ detected",       type: "danger"  });
    else if (d.spo2 < 96)        alerts.push({ msg: "SpO₂ slightly low",       type: "warning" });
    if (d.temperature > 37.8)    alerts.push({ msg: "Elevated temperature",    type: "warning" });
    else if (d.temperature < 36) alerts.push({ msg: "Low body temperature",    type: "warning" });
    (d.alerts || []).forEach(a => alerts.push({ msg: a, type: "danger" }));
  }

  /* ── Time greeting ── */
  const hour  = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  /* ── Pulse pressure label ── */
  const ppLabel = pulsePressure === null ? "No profile"
    : pulsePressure < 40 ? "Low" : pulsePressure > 60 ? "Elevated" : "Normal";

  return (
    <Layout>
      <style>{`
        @keyframes pulseGlow {
          0%,100% { transform:scale(1);    opacity:.5; }
          50%      { transform:scale(1.1); opacity:.85; }
        }
      `}</style>

      <div style={S.grid}>

        {/* [0,0] Top-Left — Greeting */}
        <div style={S.greetCard}>

          {/* Heart — large, centered, behind everything */}
          <div style={S.orbBg}>
            <HeartOrb live={isLive} size={300} />
          </div>

          {/* Text + controls layered on top */}
          <div style={S.greetLeft}>
            <div>
              <p style={S.greetSub}>{greet}</p>
              <h2 style={S.hi}>Hi, {userName}!</h2>
              <p style={S.how}>How Are You<br />Today?</p>
            </div>

            <div style={{ marginTop:"auto" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <span className={`live-dot ${isLive ? "active" : "inactive"}`} />
                <span style={{ fontSize:12, color: isLive ? "#34d399" : "#475569" }}>
                  {isLive ? `Live · ${clockTime}` : "Waiting for data"}
                </span>
              </div>
              <button
                style={{ ...S.simBtn, ...(simulating ? S.simBtnActive : {}) }}
                onClick={toggleSimulation}
              >
                {simulating ? "■ Stop Simulation" : "⚡ Start Simulation"}
              </button>
            </div>
          </div>

        </div>

        {/* [0,1] Top-Right — 4 Metric Cards (nested 2×2) */}
        <div style={S.metricsGrid}>
          <MetricCard label="Heart Rate"  value={hr}   unit="BPM" icon="🫀" danger={hrDanger} />
          <MetricCard label="SpO₂"        value={spo2} unit="%"   icon="🫁" danger={spo2Danger} />
          <MetricCard label="Steps"       value={steps}           icon="👟" />
          <MetricCard label="Temperature" value={tmp}  unit="°C"  icon="🌡️" warning={tmpWarning} />
        </div>

        {/* [1,0] Bottom-Left — Alerts + Secondary Vitals */}
        <div style={{ ...CARD, padding:"24px", display:"flex", flexDirection:"column", gap:0 }}>

          {/* Alerts — top half */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center" }}>
            <p style={S.sectionTitle}>Alerts</p>
            {alerts.length === 0 ? (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
                <span className={`live-dot ${d ? "active" : "inactive"}`} />
                <span style={{ fontSize:13, color: d ? "#34d399" : "#475569" }}>
                  {d ? "All vitals within normal range" : "No sensor data yet"}
                </span>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:7, marginTop:10 }}>
                {alerts.map((a, i) => (
                  <span key={i} className={`alert-pill ${a.type}`}>
                    {a.type === "danger" ? "⚠" : "!"} {a.msg}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", margin:"0 0 20px" }} />

          {/* Secondary Vitals — bottom half, side by side */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center" }}>
            <p style={S.sectionTitle}>Secondary Vitals</p>
            <div style={{ display:"flex", gap:10, marginTop:12 }}>
              <VitalMini
                label="Pulse Pressure"
                value={pulsePressure ?? "--"}
                unit={pulsePressure !== null ? "mmHg" : ""}
                sub={ppLabel}
              />
              <VitalMini
                label="Temp Diff"
                value={tmpDiff}
                unit={tmpDiff !== "--" ? "°C" : ""}
                sub={tmpDiff !== "--" ? "from 37.0°C" : "No data"}
              />
              <VitalMini
                label="HRV"
                value={hrv}
                unit={hrv !== "--" ? "ms" : ""}
                sub={hrv !== "--" ? (hrv > 40 ? "Normal" : "Low") : "No data"}
              />
            </div>
          </div>

        </div>

        {/* [1,1] Bottom-Right — Prediction */}
        <div style={{ ...CARD, padding:"24px", display:"flex", flexDirection:"column" }}>

          <div>
            <p style={{ margin:0, fontWeight:600, fontSize:14, color:"#e2e8f0" }}>🤖 Risk Analysis</p>
            <p style={{ margin:"4px 0 0", fontSize:12, color:"#475569" }}>
              XGBoost + Neural Net ensemble · uses health profile + last 10 readings
            </p>
          </div>

          {!prediction ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1, justifyContent:"center", gap:14 }}>
              <div style={{ fontSize:48, opacity:0.18 }}>🫀</div>
              <p style={{ margin:0, fontSize:13, color:"#475569", textAlign:"center", maxWidth:220 }}>
                Run the prediction model to assess your heart disease risk score
              </p>
              <Button
                variant="contained"
                disabled={predicting}
                style={S.predBtn}
                onClick={predict}
              >
                {predicting ? "Analysing…" : "Run Prediction"}
              </Button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:16, marginTop:20 }}>
              <div style={{
                padding:"16px 20px", borderRadius:14, textAlign:"center",
                background: prediction.risk==="High" ? "rgba(248,113,113,0.1)" : "rgba(52,211,153,0.1)",
                border:`1px solid ${prediction.risk==="High" ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.3)"}`
              }}>
                <p style={{ margin:0, fontSize:22, fontWeight:700, color: prediction.risk==="High" ? "#f87171" : "#34d399" }}>
                  {prediction.risk==="High" ? "⚠️ High Risk" : "✓ Low Risk"}
                </p>
                <p style={{ margin:"4px 0 0", fontSize:12, color:"#64748b" }}>
                  {prediction.risk==="High" ? "Consult a cardiologist soon" : "Continue healthy habits"}
                </p>
              </div>

              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:12, color:"#64748b" }}>Confidence</span>
                  <span style={{ fontSize:12, color:"#e2e8f0", fontWeight:600 }}>
                    {(prediction.probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="prob-bar-bg">
                  <div className="prob-bar-fill" style={{
                    width:`${prediction.probability * 100}%`,
                    background: prediction.risk==="High"
                      ? "linear-gradient(90deg,#818cf8,#f87171)"
                      : "linear-gradient(90deg,#818cf8,#34d399)"
                  }} />
                </div>
              </div>

              <button style={S.resetBtn} onClick={() => setPrediction(null)}>Reset Analysis</button>
            </div>
          )}

        </div>

      </div>
    </Layout>
  );
}

/* ─── shared token ─────────────────────────── */
const T = {
  label: { fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:500 }
};

/* ─── glass card base ──────────────────────── */
const CARD = {
  background: "rgba(15,12,30,0.85)",
  border: "1px solid rgba(139,92,246,0.1)",
  borderRadius: 20,
  boxShadow: "0 4px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)"
};

/* ─── layout styles ────────────────────────── */
const S = {
  /* Single 2×2 grid — fills viewport below navbar (60px) + layout padding (28px top + 48px bottom) */
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridTemplateRows: "1fr 1fr",
    gap: 14,
    height: "calc(100vh - 136px)",
    minHeight: 560
  },

  greetCard: {
    ...CARD,
    position:"relative", overflow:"hidden",
    padding:"28px 32px",
    background:"rgba(8,5,20,0.92)"
  },
  /* Heart — absolute centre of the card, subtle background */
  orbBg: {
    position:"absolute",
    top:"50%", left:"50%",
    transform:"translate(-50%, -50%)",
    pointerEvents:"none", zIndex:0,
    opacity: 0.52
  },
  /* Text — full height flex column above the heart */
  greetLeft: {
    position:"relative", zIndex:1,
    display:"flex", flexDirection:"column",
    height:"100%"
  },
  greetSub:  { margin:0, fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.09em", fontWeight:500 },
  hi:        { margin:"6px 0 0", fontSize:30, fontWeight:700, color:"#f8fafc", textShadow:"0 2px 20px rgba(0,0,0,0.8)" },
  how:       { margin:"6px 0 0", fontSize:16, color:"#cbd5e1", lineHeight:1.5, textShadow:"0 2px 12px rgba(0,0,0,0.7)" },

  simBtn: {
    marginTop:18, background:"rgba(139,92,246,0.14)",
    border:"1px solid rgba(139,92,246,0.28)", borderRadius:8,
    color:"#a78bfa", fontSize:12, padding:"6px 14px",
    cursor:"pointer", fontFamily:"'Poppins',sans-serif", transition:"all 0.2s"
  },
  simBtnActive: {
    background:"rgba(248,113,113,0.12)",
    border:"1px solid rgba(248,113,113,0.3)",
    color:"#f87171"
  },

  /* Top-right nested 2×2 for the 4 metric cards — fills its grid cell */
  metricsGrid: {
    display:"grid", gridTemplateColumns:"1fr 1fr", gridTemplateRows:"1fr 1fr", gap:14
  },

  sectionTitle: { margin:0, fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em" },

  predBtn: {
    background:"linear-gradient(90deg,#818cf8,#22d3ee)",
    boxShadow:"0 4px 20px rgba(129,140,248,0.25)",
    padding:"10px 28px", fontWeight:600
  },
  resetBtn: {
    background:"none", border:"1px solid rgba(255,255,255,0.08)",
    borderRadius:7, color:"#475569", fontSize:11,
    padding:"6px 14px", cursor:"pointer", fontFamily:"'Poppins',sans-serif",
    alignSelf:"flex-start"
  }
};
