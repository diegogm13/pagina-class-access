import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/alumno.css";
import MenuAlumno from "./menuAlumno";
import headerImg from '../escuela.png';

// 🍪 Utilidad para obtener cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }
  return null;
};

const Alumno = () => {
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
        navigate("/");
      }
    } else {
      // Si no hay cookie, redirigir al login
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="alumno-container">
      <MenuAlumno />
      
      <main className="contenido-alumno">
        {/* Header con imagen full width tipo banner */}
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
            <h1>¡Bienvenido, {nombre}!</h1>
            <p className="subtitle">Selecciona una opción del menú para comenzar.</p>
          </div>
        </div>

        {/* Contenido debajo del header */}
        <div className="main-content">
          <div className="content-card">
            <h2>Panel de Control</h2>
            <p>Aquí puedes gestionar tus actividades académicas.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Alumno;