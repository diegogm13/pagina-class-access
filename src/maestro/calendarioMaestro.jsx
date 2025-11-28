import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/maestro.css';
import '../styles/calendario.css';
import MenuMaestro from "./menuMaestro";

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
    const userDataCookie = getCookie("userData");

    if (!userDataCookie) {
      navigate("/"); // Redirige al login si no hay cookie
      return;
    }

    try {
      JSON.parse(userDataCookie); // Validamos que la cookie sea un JSON válido
    } catch (error) {
      console.error("Error al parsear userData:", error);
      navigate("/"); // Redirige si la cookie está corrupta
    }
  }, [navigate]);

  return (
    <div className="dashboard-maestro">
      <MenuMaestro />
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
