import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuMaestro from "./menuMaestro";
import '../styles/maestro.css';
import headerImg from '../maestros.jpg'; // Importamos la imagen directamente

// 🍪 Utilidad para obtener cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }
  return null;
};

const Maestro = () => {
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
        navigate("/"); // Redirige al login si la cookie está corrupta
      }
    } else {
      // Si no hay cookie, redirigir al login
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="dashboard-maestro">
      <MenuMaestro />

      <main className="contenido-maestro">
        {/* Header con imagen directamente desde JS */}
        <div
          className="header-banner"
          style={{
            backgroundImage: `url(${headerImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        >
          <div className="header-overlay">
            <h1>Bienvenido, {nombre}!</h1>
            <p className="subtitle">Selecciona una opción del menú para comenzar.</p>
          </div>
        </div>

        {/* Contenido debajo del header */}
        <div className="main-content">
          <div className="content-card">
            <h2>Panel de Maestro</h2>
            <p>Gestiona tus clases, asistencias y calificaciones.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Maestro;
