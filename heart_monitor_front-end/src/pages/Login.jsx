import { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../context/AlertContext";
import API from "../services/api";

/* ── Single ECG blip — 9 cycles, 1080 units wide ── */
const BLIP_PTS = Array.from({ length: 9 }, (_, i) => {
  const x = i * 120, cy = 50;
  return [
    `${x},${cy}`,`${x+22},${cy}`,`${x+26},${cy-9}`,`${x+30},${cy-22}`,
    `${x+34},${cy-9}`,`${x+38},${cy}`,`${x+41},${cy+8}`,`${x+45},${cy-42}`,
    `${x+49},${cy+42}`,`${x+53},${cy}`,`${x+63},${cy}`,`${x+68},${cy-8}`,
    `${x+76},${cy-20}`,`${x+84},${cy-8}`,`${x+93},${cy}`,`${x+120},${cy}`
  ].join(" ");
}).join(" ");

export default function Login() {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      showAlert("Please fill in all fields", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.access_token);
      showAlert("Welcome back!", "success");
      navigate("/dashboard");
    } catch (err) {
      showAlert(err.response?.data?.detail || "Invalid email or password", "error");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={styles.page}>

      {/* ── Single ECG blip sweeping left → right ── */}
      <style>{`@keyframes ecgSweep{from{transform:translateX(-1080px)}to{transform:translateX(100vw)}}`}</style>
      <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
        <svg viewBox="0 0 1080 100"
          style={{ position:"absolute", top:"calc(50% - 65px)", left:0,
            width:"1080px", height:"130px", opacity:0.22,
            animation:"ecgSweep 10s linear infinite" }}>
          <polyline points={BLIP_PTS} fill="none" stroke="#a78bfa" strokeWidth="2"
            strokeLinejoin="round" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Invisible blocker — same footprint as content, hides ECG behind it */}
      <div style={styles.blocker} />

      <div style={styles.inner}>

        {/* ── Branding card ── */}
        <div style={styles.brandCard}>
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}>❤️</div>
            <span style={styles.logoText}>DigitalTwin</span>
          </div>
          <h1 style={styles.tagline}>
            Your cardiac health,<br />
            <span style={{ ...styles.tagline, ...styles.taglineAccent }}>
              always in sight.
            </span>
          </h1>
        </div>

        {/* ── Form (no card) ── */}
        <div style={styles.formWrap}>
          <Typography variant="h5" style={styles.formTitle}>Welcome back</Typography>
          <Typography style={styles.formSub}>Sign in to your account</Typography>

          <TextField
            label="Email address"
            fullWidth
            margin="normal"
            size="small"
            value={form.email}
            onChange={set("email")}
            onKeyDown={onKey}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            size="small"
            value={form.password}
            onChange={set("password")}
            onKeyDown={onKey}
          />

          <Button
            variant="contained"
            fullWidth
            disabled={loading}
            style={styles.btn}
            onClick={handleLogin}
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>

          <Typography style={styles.switchText}>
            Don't have an account?{" "}
            <span style={styles.switchLink} onClick={() => navigate("/signup")}>
              Create one
            </span>
          </Typography>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px"
  },
  blocker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "820px",
    height: "380px",
    background: "#080710",
    zIndex: 1,
    pointerEvents: "none"
  },
  inner: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    gap: "48px",
    width: "100%",
    maxWidth: "780px",
    alignItems: "center"
  },

  /* Branding glass card — compact */
  brandCard: {
    flex: "0 0 240px",
    background: "rgba(15,12,30,1)",
    border: "1px solid rgba(139,92,246,0.12)",
    borderRadius: "20px",
    boxShadow: "0 4px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
    padding: "32px 28px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "32px"
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #a78bfa, #e879f9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px"
  },
  logoText: {
    fontWeight: 700,
    fontSize: "17px",
    background: "linear-gradient(90deg, #a78bfa, #e879f9)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text"
  },
  tagline: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: 1.35,
    color: "#e2e8f0"
  },
  taglineAccent: {
    background: "linear-gradient(90deg, #a78bfa, #e879f9)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text"
  },

  formWrap: {
    flex: 1,
    maxWidth: "360px",
    background: "#080710",
    borderRadius: "12px",
    padding: "24px"
  },
  formTitle: {
    fontWeight: 700,
    marginBottom: "6px",
    color: "#e2e8f0"
  },
  formSub: {
    color: "#64748b",
    fontSize: "13px",
    marginBottom: "8px"
  },
  btn: {
    marginTop: "16px",
    padding: "10px",
    background: "linear-gradient(90deg, #a78bfa, #e879f9)",
    boxShadow: "0 4px 20px rgba(129, 140, 248, 0.3)",
    fontWeight: 600
  },
  switchText: {
    marginTop: "20px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "13px"
  },
  switchLink: {
    color: "#818cf8",
    cursor: "pointer",
    fontWeight: 500
  }
};
