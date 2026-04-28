import { useEffect } from "react";

const config = {
  success: { bg: "rgba(52, 211, 153, 0.1)",  border: "rgba(52, 211, 153, 0.3)",  color: "#34d399", icon: "✓" },
  error:   { bg: "rgba(248, 113, 113, 0.1)", border: "rgba(248, 113, 113, 0.3)", color: "#f87171", icon: "✕" },
  warning: { bg: "rgba(251, 191, 36, 0.1)",  border: "rgba(251, 191, 36, 0.3)",  color: "#fbbf24", icon: "⚠" },
  info:    { bg: "rgba(129, 140, 248, 0.1)", border: "rgba(129, 140, 248, 0.3)", color: "#818cf8", icon: "i" }
};

export default function CustomAlert({ alert, setAlert }) {
  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(() => setAlert(null), 3500);
    return () => clearTimeout(t);
  }, [alert]);

  if (!alert) return null;

  const c = config[alert.type] ?? config.info;

  return (
    <div style={{ ...styles.wrap, background: c.bg, border: `1px solid ${c.border}` }}>
      <span style={{ ...styles.icon, color: c.color, border: `1px solid ${c.border}` }}>
        {c.icon}
      </span>
      <span style={{ ...styles.msg, color: c.color }}>{alert.message}</span>
      <button style={styles.close} onClick={() => setAlert(null)}>✕</button>
    </div>
  );
}

const styles = {
  wrap: {
    position: "fixed",
    top: "20px",
    right: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "12px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    zIndex: 9999,
    maxWidth: "360px",
    animation: "fadeIn 0.2s ease"
  },
  icon: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 700,
    flexShrink: 0
  },
  msg: {
    fontSize: "13px",
    fontWeight: 500,
    lineHeight: 1.4,
    flex: 1
  },
  close: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "12px",
    padding: "0 2px",
    flexShrink: 0
  }
};
