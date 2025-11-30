import React from "react";
import Login from "./components/login";
import RegistroAlumno from "./components/registro";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute"; // 🔒 Importar ProtectedRoute
import LandingPage from "./components/LandingPage"; // Agregar import


// Admin
import Admi from "./admi/dashboardAdmi";
import Usuarios from "./admi/usuarios";
import RegistrarUsuario from "./admi/registrarUsuario";
import PerfilAdmin from "./admi/perfilAdmi";
import EnviarNotificaciones from "./admi/enviarNotificaciones";
import Reportes from "./admi/reportes";
import Dispositivos from "./admi/dispositivos";
import Aulas from "./admi/aulas";
import Asistencias from "./admi/asistencias";

// Maestro
import Maestro from "./maestro/dashboardMaestros";
import PerfilMaestro from "./maestro/perfilMaestro";
import CalendarioMaestro from "./maestro/calendarioMaestro";
import Codigo_QR from "./maestro/Codigo_QR";
import HistorialMaestros from "./maestro/historialMaestro";
import HorarioMaestro from "./maestro/horarioMaestro";
import ListasMaestro from "./maestro/listasMaestro";
import NotificacionesMaestro from "./maestro/notificacionesMaestro";

// Alumno
import Alumno from "./alumno/dashboardAlumno";
import PerfilAlumno from "./alumno/perfilAlumno";
import Historial from "./alumno/historialAlumno";
import CodigoQr from "./alumno/CodigoQr";
import MenuAlumno from "./alumno/menuAlumno";
import Calendario from "./alumno/Calendario";
import Notificationes from "./alumno/Notificaciones_alumno";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌐 Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/RegistroAlumno" element={<RegistroAlumno/>}/>

        {/* 👨‍🎓 Rutas de ALUMNO (priv_usu = 1) */}
        <Route 
          path="/alumno" 
          element={
            <ProtectedRoute requiredPriv={1}>
              <Alumno />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/perfilAlumno" 
          element={
            <ProtectedRoute requiredPriv={1}>
              <PerfilAlumno />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/historialAlumno" 
          element={
            <ProtectedRoute requiredPriv={1}>
              <Historial />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/CodigoQR" 
          element={
            <ProtectedRoute requiredPriv={1}>
              <CodigoQr />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/menuAlumno" 
          element={
            <ProtectedRoute requiredPriv={1}>
              <MenuAlumno />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Calendario" 
          element={
            <ProtectedRoute requiredPriv={1}>
              <Calendario />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Notificaciones_alumno" 
          element={
            <ProtectedRoute requiredPriv={1}>
              <Notificationes />
            </ProtectedRoute>
          } 
        />

        {/* 👨‍🏫 Rutas de MAESTRO (priv_usu = 2) */}
        <Route 
          path="/maestro" 
          element={
            <ProtectedRoute requiredPriv={2}>
              <Maestro />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/perfilMaestro" 
          element={
            <ProtectedRoute requiredPriv={2}>
              <PerfilMaestro />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/calendarioMaestro" 
          element={
            <ProtectedRoute requiredPriv={2}>
              <CalendarioMaestro />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/codigo_Qr" 
          element={
            <ProtectedRoute requiredPriv={2}>
              <Codigo_QR />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/historialMaestros" 
          element={
            <ProtectedRoute requiredPriv={2}>
              <HistorialMaestros />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/horarioMaestro" 
          element={
            <ProtectedRoute requiredPriv={2}>
              <HorarioMaestro />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Listas" 
          element={
            <ProtectedRoute requiredPriv={2}>
              <ListasMaestro />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Notificaciones" 
          element={
            <ProtectedRoute requiredPriv={2}>
              <NotificacionesMaestro />
            </ProtectedRoute>
          } 
        />

        {/* 👨‍💼 Rutas de ADMIN (priv_usu = 3) */}
        <Route 
          path="/admi" 
          element={
            <ProtectedRoute requiredPriv={3}>
              <Admi />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute requiredPriv={3}>
              <Usuarios />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/registro" 
          element={
            <ProtectedRoute requiredPriv={3}>
              <RegistrarUsuario />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/perfilAdmin" 
          element={
            <ProtectedRoute requiredPriv={3}>
              <PerfilAdmin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/perfilAdmi" 
          element={
            <ProtectedRoute requiredPriv={3}>
              <PerfilAdmin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/asistencias" 
          element={
            <ProtectedRoute requiredPriv={3}>
              <Asistencias />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notificaciones" 
          element={
            <ProtectedRoute requiredPriv={3}>
              <EnviarNotificaciones />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/enviarNotificaciones" 
          element={
            <ProtectedRoute requiredPriv={3}>
              <EnviarNotificaciones />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reportes" 
          element={
            <ProtectedRoute requiredPriv={3}>
              <Reportes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dispositivos" 
          element={
            <ProtectedRoute requiredPriv={3}>
              <Dispositivos />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/aulas" 
          element={
            <ProtectedRoute requiredPriv={3}>
              <Aulas />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;