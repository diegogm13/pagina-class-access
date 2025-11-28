import React, { useEffect } from "react";
import '../styles/maestro.css';
import '../styles/calendario.css';
import MenuAlumno from "./menuAlumno";
import { useNavigate } from "react-router-dom";

// 🍪 Utilidad para obtener cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }
  return null;
};

const CalendarioMaestro = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 🍪 Obtener datos del usuario desde la cookie
    const userDataCookie = getCookie("userData");

    if (!userDataCookie) {
      navigate("/"); // Redirige al login si no hay cookie
      return;
    }

    try {
      const usuario = JSON.parse(userDataCookie);
      if (!usuario || !usuario.id_usu) {
        navigate("/"); // Redirige si el usuario es inválido
      }
    } catch (error) {
      console.error("Error al parsear userData:", error);
      navigate("/"); // Redirige si hay error al parsear
    }
  }, [navigate]);

  return (
    <div className="dashboard-maestro">
      <MenuAlumno />
      <main className="contenido-maestro">
        <h1 className="titulo-calendario">Calendario Escolar</h1>
        
        <div className="contenedor-calendario">
          {/* Primer calendario */}
          <div className="tarjeta-calendario">
            <img
              src="./calendarioEscolar1.JPG"
              alt="Calendario 2023-2024"
              className="imagen-calendario"
            />
          </div>
          
          {/* Segundo calendario (si lo necesitas) */}
          {/* <div className="tarjeta-calendario">
              <img
                  src="./calendarioEscolar2.JPG"
                  alt="Calendario 2023-2024"
                  className="imagen-calendario"
              />
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default CalendarioMaestro;
