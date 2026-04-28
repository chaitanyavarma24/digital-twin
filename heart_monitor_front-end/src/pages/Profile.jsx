import { useState, useEffect } from "react";
import { Typography, TextField, MenuItem, Box, Button, CircularProgress } from "@mui/material";
import GlassCard from "../components/common/GlassCard";
import { useAlert } from "../context/AlertContext";
import Layout from "../components/layout/Layout";
import API from "../services/api";

const EMPTY = {
  age: "", bmi: "", sex: "", smoking: "",
  alcohol: "", diabetes: "", systolic_bp: "", diastolic_bp: "", cholesterol: ""
};

export default function Profile() {
  const { showAlert } = useAlert();
  const [health,   setHealth]   = useState(EMPTY);
  const [personal, setPersonal] = useState({});
  const [complete, setComplete] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setPersonal(stored);

    API.get("/profile/")
      .then(({ data: { type, data } }) => {
        if (type === "health") {
          setComplete(true);
          setHealth({
            age:          data.age          ?? "",
            bmi:          data.bmi          ?? "",
            sex:          data.sex          ?? "",
            smoking:      data.smoking      ?? "",
            alcohol:      data.alcohol      ?? "",
            diabetes:     data.diabetes     ?? "",
            systolic_bp:  data.systolic_bp  ?? "",
            diastolic_bp: data.diastolic_bp ?? "",
            cholesterol:  data.cholesterol  ?? ""
          });
          // Also pull personal fields from response if backend sends them,
          // otherwise fall back to localStorage (which now includes phone)
          setPersonal((p) => ({
            first_name: data.first_name || p.first_name || "",
            last_name:  data.last_name  || p.last_name  || "",
            email:      data.email      || p.email      || "",
            phone:      data.phone      || p.phone      || ""
          }));
        } else if (type === "basic") {
          setPersonal((p) => ({
            first_name: data.first_name || p.first_name || "",
            last_name:  data.last_name  || p.last_name  || "",
            email:      data.email      || p.email      || "",
            phone:      data.phone      || p.phone      || ""
          }));
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const setH = (f) => (e) => setHealth({ ...health, [f]: e.target.value });

  const handleSave = async () => {
    const empty = Object.values(health).some((v) => v === "" || v === null || v === undefined);
    if (empty) { showAlert("Please fill in all health fields", "warning"); return; }

    setSaving(true);
    try {
      await API.post("/profile/", {
        age:          parseInt(health.age),
        bmi:          parseFloat(health.bmi),
        sex:          parseInt(health.sex),
        smoking:      parseInt(health.smoking),
        alcohol:      parseInt(health.alcohol),
        diabetes:     parseInt(health.diabetes),
        systolic_bp:  parseInt(health.systolic_bp),
        diastolic_bp: parseInt(health.diastolic_bp),
        cholesterol:  parseInt(health.cholesterol)
      });
      setComplete(true);
      showAlert("Health profile saved — predictions enabled!", "success");
    } catch (err) {
      const d = err.response?.data?.detail;
      showAlert(Array.isArray(d) ? "Check your input values" : (d || "Save failed"), "error");
    } finally { setSaving(false); }
  };

  const initials = [personal.first_name?.[0], personal.last_name?.[0]]
    .filter(Boolean).join("").toUpperCase() || "?";

  const pulsePressure =
    health.systolic_bp !== "" && health.diastolic_bp !== ""
      ? `${parseInt(health.systolic_bp) - parseInt(health.diastolic_bp)} mmHg`
      : "—";

  if (fetching) return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "center", paddingTop: "100px" }}>
        <CircularProgress />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={styles.page}>

        {/* ── Profile header ── */}
        <GlassCard style={styles.headerCard}>
          <div style={styles.avatarWrap}>
            <div style={styles.avatar}>{initials}</div>
            <div style={styles.avatarRing} />
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={styles.name}>
              {personal.first_name
                ? `${personal.first_name} ${personal.last_name || ""}`.trim()
                : (personal.email || "Your Profile")}
            </h2>
            <p style={styles.email}>{personal.email || ""}</p>
          </div>

          <div style={styles.statusBadge}>
            <div style={{
              ...styles.statusDot,
              background: complete ? "#34d399" : "#fbbf24"
            }} />
            <span style={{
              fontSize: "12px",
              color: complete ? "#34d399" : "#fbbf24",
              fontWeight: 500
            }}>
              {complete ? "Health profile complete" : "Health profile incomplete"}
            </span>
          </div>
        </GlassCard>

        {/* ── Incomplete banner ── */}
        {!complete && (
          <div className="profile-banner">
            ⚠️ Fill in your <strong>Health Information</strong> to enable heart disease risk predictions.
          </div>
        )}

        {/* ── Two-column grid ── */}
        <div style={styles.grid}>

          {/* Personal info — read-only */}
          <GlassCard>
            <SectionTitle icon="👤" label="Personal Information" />
            <p style={styles.readonlyNote}>Saved at signup · read-only</p>

            <Row>
              <ReadField label="First Name" value={personal.first_name} />
              <ReadField label="Last Name"  value={personal.last_name} />
            </Row>
            <Row>
              <ReadField label="Email" value={personal.email} />
              <ReadField label="Phone" value={personal.phone} />
            </Row>
          </GlassCard>

          {/* Health info — editable */}
          <GlassCard>
            <SectionTitle icon="🩺" label="Health Information" />

            <Row>
              <TextField label="Age *"  type="number" size="small" fullWidth
                helperText="Years" value={health.age} onChange={setH("age")} />
              <TextField label="BMI *"  type="number" size="small" fullWidth
                helperText="Normal: 18.5 – 24.9" value={health.bmi} onChange={setH("bmi")} />
            </Row>

            <Row>
              <TextField select label="Sex *" size="small" fullWidth
                value={health.sex} onChange={setH("sex")}>
                <MenuItem value={0}>Female</MenuItem>
                <MenuItem value={1}>Male</MenuItem>
              </TextField>
              <TextField select label="Smoking *" size="small" fullWidth
                value={health.smoking} onChange={setH("smoking")}>
                <MenuItem value={0}>Non-smoker</MenuItem>
                <MenuItem value={1}>Occasional</MenuItem>
                <MenuItem value={2}>Regular</MenuItem>
              </TextField>
            </Row>

            <Row>
              <TextField select label="Alcohol *" size="small" fullWidth
                value={health.alcohol} onChange={setH("alcohol")}>
                <MenuItem value={0}>None</MenuItem>
                <MenuItem value={1}>Occasional</MenuItem>
                <MenuItem value={2}>Regular</MenuItem>
              </TextField>
              <TextField select label="Diabetes *" size="small" fullWidth
                value={health.diabetes} onChange={setH("diabetes")}>
                <MenuItem value={0}>No</MenuItem>
                <MenuItem value={1}>Yes</MenuItem>
              </TextField>
            </Row>

            <Row>
              <TextField label="Systolic BP *"  type="number" size="small" fullWidth
                helperText="Normal: < 120 mmHg" value={health.systolic_bp}  onChange={setH("systolic_bp")} />
              <TextField label="Diastolic BP *" type="number" size="small" fullWidth
                helperText="Normal: < 80 mmHg"  value={health.diastolic_bp} onChange={setH("diastolic_bp")} />
            </Row>

            <Row>
              <TextField label="Cholesterol *" type="number" size="small" fullWidth
                helperText="mg/dL (e.g. 180)" value={health.cholesterol} onChange={setH("cholesterol")} />
              <TextField label="Pulse Pressure" size="small" fullWidth
                value={pulsePressure} helperText="Auto-calculated"
                InputProps={{ readOnly: true }} style={{ opacity: 0.55 }} />
            </Row>

            <Button
              variant="contained"
              fullWidth
              disabled={saving}
              style={styles.saveBtn}
              onClick={handleSave}
            >
              {saving ? "Saving…" : "Save Health Profile"}
            </Button>
          </GlassCard>

        </div>
      </div>
    </Layout>
  );
}

/* ── small helpers ── */
function SectionTitle({ icon, label }) {
  return (
    <p style={{
      margin: "0 0 4px",
      fontWeight: 600,
      fontSize: "13px",
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.06em"
    }}>
      {icon}&nbsp; {label}
    </p>
  );
}

function Row({ children }) {
  return <Box style={{ display: "flex", gap: "14px", marginBottom: "16px", marginTop: "14px" }}>{children}</Box>;
}

function ReadField({ label, value }) {
  return (
    <TextField
      label={label} size="small" fullWidth
      value={value || ""}
      InputProps={{ readOnly: true }}
      style={{ opacity: 0.55 }}
    />
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    maxWidth: "1100px",
    margin: "0 auto"
  },

  /* Header card */
  headerCard: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "22px 28px"
  },
  avatarWrap: {
    position: "relative",
    flexShrink: 0
  },
  avatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #818cf8, #22d3ee)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: 700,
    position: "relative",
    zIndex: 1
  },
  avatarRing: {
    position: "absolute",
    inset: "-3px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #818cf8, #22d3ee)",
    opacity: 0.25,
    zIndex: 0
  },
  name: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#e2e8f0"
  },
  email: {
    margin: "3px 0 0",
    fontSize: "13px",
    color: "#64748b"
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    marginLeft: "auto",
    flexShrink: 0
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    alignItems: "start"
  },
  readonlyNote: {
    margin: "8px 0 0",
    fontSize: "11px",
    color: "#334155"
  },

  saveBtn: {
    marginTop: "6px",
    padding: "10px",
    background: "linear-gradient(90deg, #818cf8, #22d3ee)",
    boxShadow: "0 4px 20px rgba(129, 140, 248, 0.25)",
    fontWeight: 600
  }
};
