import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@mui/material";
import theme from "./styles/theme";
import "./styles/glass.css";
import { AlertProvider } from "./context/AlertContext"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <AlertProvider>   
        <App />
      </AlertProvider>
    </ThemeProvider>
  </React.StrictMode>
);