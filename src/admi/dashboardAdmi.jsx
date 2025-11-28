import React, { useEffect, useState } from "react";
import "../styles/administrador.css";
import { useNavigate } from "react-router-dom";
import MenuAdmin from "./menuAdmi";
import HeaderImage from "../uteq-administrador.jpeg";

// 🍪 Utilidad para obtener cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }
  return null;
};

const Admi = () => {
  const [nombre, setNombre] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 🍪 Obtener datos del usuario desde la cookie
    const userDataCookie = getCookie("userData");

    if (userDataCookie) {
      try {
        const usuario = JSON.parse(userDataCookie);
        setNombre(usuario.nombre_usu);
      } catch (error) {
        console.error("Error al parsear userData:", error);
        navigate("/"); // Redirige al login si hay error
      }
    } else {
      // Si no hay cookie, redirigir al login
      navigate("/");
    }
  }, [navigate]);

  const irUsuarios = () => {
    navigate("/usuarios");
  };

  const cerrarSesion = () => {
    // Elimina la cookie del usuario al cerrar sesión
    document.cookie = "userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/");
  };

  return (
    <div className="dashboard-administrador">
      <MenuAdmin />

      <main className="contenido-administrador">
        <div 
          className="header-banner"
          style={{ backgroundImage: `url(${HeaderImage})` }}
        >
          <div className="header-overlay">
            <h1>Bienvenido, {nombre}!</h1>
            <p className="subtitle">Selecciona una opción del menú para comenzar.</p>
          </div>
        </div>

        <div className="main-content">
          <div className="content-card">
            <h2>Panel de Administración</h2>
            <p>Gestiona usuarios, asistencias y toda la información del sistema.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admi;
