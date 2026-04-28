export default function GlassCard({ children, style }) {
  return (
    <div className="glass" style={style}>
      {children}
    </div>
  );
}