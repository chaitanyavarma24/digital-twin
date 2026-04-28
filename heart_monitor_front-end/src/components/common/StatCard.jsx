/* Premium StatCard — standalone, no GlassCard wrapper */

const accent = {
  normal:  "linear-gradient(90deg, #818cf8, #22d3ee)",
  warning: "linear-gradient(90deg, #fbbf24, #f97316)",
  danger:  "linear-gradient(90deg, #f87171, #ef4444)"
};

const valueColor = {
  normal:  "#e2e8f0",
  warning: "#fbbf24",
  danger:  "#f87171"
};

const cardGlow = {
  warning: "0 0 24px rgba(251, 191, 36, 0.1)",
  danger:  "0 0 24px rgba(248, 113, 113, 0.12)"
};

export default function StatCard({ title, value, status = "normal", compact = false }) {
  return (
    <div style={{
      ...styles.card,
      padding: compact ? "14px 18px" : "20px 22px",
      boxShadow: cardGlow[status]
        ? `0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2), ${cardGlow[status]}`
        : "0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)"
    }}>
      {/* Top accent line */}
      <div style={{ ...styles.accentBar, background: accent[status] ?? accent.normal }} />

      {/* Content */}
      <p style={{ ...styles.title, fontSize: compact ? "11px" : "12px" }}>{title}</p>
      <p style={{
        ...styles.value,
        fontSize: compact ? "20px" : "26px",
        color: valueColor[status] ?? valueColor.normal
      }}>
        {value}
      </p>
    </div>
  );
}

const styles = {
  card: {
    position: "relative",
    overflow: "hidden",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: "16px",
    animation: "fadeIn 0.35s ease"
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px"
  },
  title: {
    margin: "8px 0 6px",
    color: "#64748b",
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase"
  },
  value: {
    margin: 0,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.01em"
  }
};
