import { createContext, useState, useContext } from "react";

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = "info") => {
    setAlert({ message, type });
  };

  return (
    <AlertContext.Provider value={{ showAlert, alert, setAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);