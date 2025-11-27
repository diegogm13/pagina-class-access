import React, { useEffect, useState } from "react";
import "../styles/administrador.css";
import { useNavigate } from "react-router-dom";
import MenuAdmin from "./menuAdmi";

// Importa la imagen directamente
import HeaderImage from "../uteq-administrador.jpeg";

const Admi = () => {
  const [nombre, setNombre] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioGuardado) {
      setNombre(usuarioGuardado.nombre_usu); 
    } else {
      window.location.href = "/";
    }
  }, []);

  const irUsuarios = () => {
    navigate("/usuarios");
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  return (
    <div className="dashboard-administrador">
      <MenuAdmin />

      <main className="contenido-administrador">
        {/* Header con imagen de fondo usando import JS */}
        <div 
          className="header-banner"
          style={{ backgroundImage: `url(${HeaderImage})` }}
        >
          <div className="header-overlay">
            <h1>Bienvenido, {nombre}!</h1>
            <p className="subtitle">Selecciona una opción del menú para comenzar.</p>
          </div>
        </div>

        {/* Contenido debajo del header */}
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
