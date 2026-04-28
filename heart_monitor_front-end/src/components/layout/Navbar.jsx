import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const isActive  = (path) => location.pathname === path;

  // User initials from localStorage
  const info    = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const initials = [info.first_name?.[0], info.last_name?.[0]]
    .filter(Boolean).join("").toUpperCase() || "?";

  return (
    <nav style={styles.nav}>

      {/* Brand */}
      <div style={styles.brand} onClick={() => navigate("/dashboard")}>
        <div style={styles.logoIcon}>❤️</div>
        <span style={styles.logoText}>DigitalTwin</span>
      </div>

      {/* Nav links */}
      <div style={styles.links}>
        <NavItem label="Dashboard" active={isActive("/dashboard")} onClick={() => navigate("/dashboard")} />
        <NavItem label="History"   active={isActive("/history")}   onClick={() => navigate("/history")} />
        <NavItem label="Profile"   active={isActive("/profile")}   onClick={() => navigate("/profile")} />
      </div>

      {/* Right side: avatar + logout */}
      <div style={styles.right}>
        <div style={styles.avatar} title={info.first_name || "User"}>{initials}</div>
        <button
          style={styles.logoutBtn}
          onClick={() => { localStorage.removeItem("token"); navigate("/"); }}
        >
          Sign out
        </button>
      </div>

    </nav>
  );
}

function NavItem({ label, active, onClick }) {
  return (
    <span
      onClick={onClick}
      style={active ? styles.linkActive : styles.linkInactive}
    >
      {label}
    </span>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 32px",
    height: "60px",
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(8, 6, 18, 0.9)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)"
  },

  /* Brand */
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    userSelect: "none"
  },
  logoIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #a78bfa, #e879f9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    flexShrink: 0
  },
  logoText: {
    fontWeight: 700,
    fontSize: "15px",
    background: "linear-gradient(90deg, #a78bfa, #e879f9)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "0.01em"
  },

  /* Nav links */
  links: {
    display: "flex",
    gap: "4px",
    alignItems: "center"
  },
  linkActive: {
    padding: "6px 16px",
    borderRadius: "20px",
    background: "rgba(129, 140, 248, 0.12)",
    border: "1px solid rgba(129, 140, 248, 0.2)",
    color: "#818cf8",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    userSelect: "none"
  },
  linkInactive: {
    padding: "6px 16px",
    borderRadius: "20px",
    color: "#64748b",
    fontSize: "13px",
    cursor: "pointer",
    userSelect: "none",
    transition: "color 0.2s"
  },

  /* Right */
  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #818cf8, #22d3ee)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "default",
    userSelect: "none",
    flexShrink: 0
  },
  logoutBtn: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "8px",
    color: "#64748b",
    fontSize: "12px",
    padding: "5px 12px",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    transition: "border-color 0.2s, color 0.2s"
  }
};
