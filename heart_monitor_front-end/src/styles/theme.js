import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#a78bfa",
      light: "#c4b5fd",
      dark: "#7c3aed"
    },
    secondary: {
      main: "#22d3ee"
    },
    background: {
      default: "#080710",
      paper: "rgba(15, 12, 30, 0.85)"
    },
    success: { main: "#34d399" },
    warning: { main: "#fbbf24" },
    error:   { main: "#f87171" }
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            "& fieldset": {
              borderColor: "rgba(255,255,255,0.08)"
            },
            "&:hover fieldset": {
              borderColor: "rgba(129, 140, 248, 0.35)"
            },
            "&.Mui-focused fieldset": {
              borderColor: "#818cf8",
              borderWidth: "1px"
            }
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#818cf8"
          },
          "& .MuiFormHelperText-root": {
            color: "#64748b",
            fontSize: "11px"
          }
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "14px"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          textTransform: "none",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 500,
          letterSpacing: "0.01em"
        },
        outlined: {
          borderColor: "rgba(255,255,255,0.12)",
          color: "#94a3b8",
          "&:hover": {
            borderColor: "rgba(129, 140, 248, 0.4)",
            background: "rgba(129, 140, 248, 0.06)"
          }
        }
      }
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: { color: "#818cf8" }
      }
    }
  }
});

export default theme;
