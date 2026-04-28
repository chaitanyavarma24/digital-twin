import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  main: {
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "28px 32px 48px"
  }
};
