import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MenuMaestro = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const irInicio = () => {
    navigate("/maestro");
    setMobileMenuOpen(false);
  };

  const irPerfil = () => {
    navigate("/perfilMaestro");
    setMobileMenuOpen(false);
  };

  const irCalendario = () => {
    navigate("/calendarioMaestro");
    setMobileMenuOpen(false);
  };

  const irHistorial = () => {
    navigate("/historialMaestros");
    setMobileMenuOpen(false);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("id_usu");
    localStorage.removeItem("accessToken");   // si lo guardas
    localStorage.removeItem("refreshToken");  // si lo guardas

    navigate("/"); // Redirige al login
  };

  const irQr = () => {
    navigate("/Codigo_QR");
    setMobileMenuOpen(false);
  };

  const irListas = () => {
    navigate("/Listas");
    setMobileMenuOpen(false);
  };

  const irNotificaciones = () => {
    navigate("/Notificaciones");
    setMobileMenuOpen(false);
  };  

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <aside className={`sidebar-maestro ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <h2>Maestro</h2>
      
      {/* Botón hamburguesa para móviles */}
      <div className="menu-toggle" onClick={toggleMobileMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <ul>
        <li onClick={irInicio}>
          <span>Inicio</span>
        </li>
        <li onClick={irPerfil}>
          <span>Perfil</span>
        </li>
        <li onClick={irQr}>
          <span>Código QR</span>
        </li>
        <li onClick={irCalendario}>
          <span>Calendario</span>
        </li>
        <li onClick={irHistorial}>
          <span>Historial</span>
        </li>
        <li onClick={irListas}>
          <span>Listas</span>
        </li>
        <li onClick={irNotificaciones}>
          <span>Notificaciones</span>
        </li>
        <li className="logout" onClick={cerrarSesion}>
          <span>Cerrar sesión</span>
        </li>
      </ul>
    </aside>
  );
};

export default MenuMaestro;

