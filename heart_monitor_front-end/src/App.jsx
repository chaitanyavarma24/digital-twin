import AppRoutes from "./routes/AppRoutes";
import CustomAlert from "./components/common/CustomAlert";
import { useAlert } from "./context/AlertContext";

function App() {
  const { alert, setAlert } = useAlert();

  return (
    <>
      <AppRoutes />
      <CustomAlert alert={alert} setAlert={setAlert} />
    </>
  );
}

export default App;