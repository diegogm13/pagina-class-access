import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuMaestro from "./menuMaestro";
import '../styles/maestro.css';
import headerImg from '../maestros.jpg'; // Importamos la imagen directamente

const Maestro = () => {
  const [nombre, setNombre] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));

    if (usuarioGuardado) {
      setNombre(usuarioGuardado.nombre_usu);
    } else {
      navigate("/"); // Redirige al login si no hay usuario
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
