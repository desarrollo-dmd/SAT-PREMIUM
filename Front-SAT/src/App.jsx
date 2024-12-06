import { Login } from "./components/custom/pages/Login.jsx";
import { FormOrdenTrabajo } from "./components/custom/forms/FormOrdenTrabajo.jsx";
import Navbar from "./components/custom/Navbar.jsx";
import { HomeAdmin } from "./components/custom/pages/HomeAdmin.jsx";
import { TableGeneric } from "./components/custom/tables/TableGeneric.jsx";
import { FormOTAsignadas } from "./components/custom/forms/FormOTAsign.jsx";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import FormParametros from "./components/custom/forms/FormParams.jsx";
import { TablaDinamica } from "./components/custom/tables/TableParams.jsx";
import ProtectedRouteLogout from './protected/ProtectedRouteLogout.js';
import ProtectedRouteLogin from "./protected/ProtectedRouteLogin.js";
import { TableUsers } from "./components/custom/tables/TableUsers.jsx";
import VincularServiciosDialog from "./components/custom/VincularServiciosDialog.jsx"
import OrdenarParametrosForm from "./components/custom/forms/ordenarParametrosForm.jsx";
import DragAndDropList from "./components/custom/DragAndDrop.jsx"

const AppContent = () => {
  const location = useLocation();

  // Definir los items para el drag and drop

  return (
    <div>
      {/* Renderiza el Navbar solo si no estamos en la página de Login */}
      {location.pathname !== "/" && <Navbar />}
      <Routes>
        <Route path="/" element={<ProtectedRouteLogin element={<Login />} />} />
        <Route path="/formParams/:id/:estado/:idequipo" element={<ProtectedRouteLogout element={<FormParametros />} />} />
        <Route path="/OTasignUsers" element={<ProtectedRouteLogout element={<FormOrdenTrabajo />} />} />
        <Route path="/OTasign" element={<ProtectedRouteLogout element={<FormOTAsignadas />} />} />
        <Route path="/HomeAdmin" element={<ProtectedRouteLogout element={<HomeAdmin />} />} />
        <Route path="/testtabla" element={<ProtectedRouteLogout element={<TableGeneric />} />} />
        <Route path="/Users" element={<ProtectedRouteLogout element={<TableUsers />} />} />
        <Route path="/Params" element={<ProtectedRouteLogout element={<TablaDinamica />} />} />
        <Route path="/nodos" element={<VincularServiciosDialog />} />
        <Route path="/ordenar-parametros" element={<OrdenarParametrosForm />} />
        <Route path="/Drag" element={<DragAndDropList />} />

      </Routes>
    </div>
  );
};
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
