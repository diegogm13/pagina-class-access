import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/maestro.css";
import "../styles/historialMaestro.css";
import MenuMaestro from "./menuMaestro";
import { useNavigate } from "react-router-dom";

// 🍪 Utilidad para obtener cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(";").shift());
  }
  return null;
};

const HistorialMaestros = () => {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  useEffect(() => {
    const userDataCookie = getCookie("userData");

    if (!userDataCookie) {
      navigate("/"); // Redirige al login si no hay cookie
      return;
    }

    let usuario;
    try {
      usuario = JSON.parse(userDataCookie);
    } catch (error) {
      console.error("Error al parsear userData:", error);
      navigate("/"); // Redirige si la cookie está corrupta
      return;
    }

    const id_usu = usuario.id_usu;

    setCargando(true);
    axios
      .get(`http://localhost:3001/api/students/${id_usu}/history`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setHistorial(res.data.data);
        } else {
          setHistorial([]);
        }
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al obtener historial:", err);
        setHistorial([]);
        setCargando(false);
      });
  }, [navigate]);

  // --- FORMATEAR FECHA SIN RESTAR UN DÍA ---
  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const str = String(fecha).trim();
    const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      const [yyyy, mm, dd] = match[1].split("-");
      return `${dd}/${mm}/${yyyy}`;
    }
    return str;
  };

  // --- PAGINACIÓN ---
  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const registrosActuales = historial.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(historial.length / registrosPorPagina);

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  return (
    <div className="dashboard-maestro">
      <MenuMaestro />

      <main className="contenido-maestro">
        <h1 className="titulo-seccion">Historial de Asistencias</h1>

        {cargando ? (
          <div className="cargando-historial">
            <div className="spinner-historial"></div>
            <p>Cargando historial...</p>
          </div>
        ) : historial.length === 0 ? (
          <div className="sin-registros">
            <p>No se encontraron registros de asistencia</p>
          </div>
        ) : (
          <>
            <div className="info-registros">
              <p>
                Mostrando {indicePrimero + 1} - {Math.min(indiceUltimo, historial.length)} de{" "}
                {historial.length} registros
              </p>
            </div>

            <div className="contenedor-tabla">
              <div className="tabla-responsive">
                <table className="tabla-historial">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Entrada</th>
                      <th>Salida</th>
                      <th>Aula</th>
                      <th>Edificio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosActuales.map((registro, index) => (
                      <tr key={index}>
                        <td data-label="Fecha">{formatFecha(registro.fecha)}</td>
                        <td data-label="Entrada">{registro.hora_entrada ? registro.hora_entrada.split(".")[0] : "-"}</td>
                        <td data-label="Salida">{registro.hora_salida ? registro.hora_salida.split(".")[0] : "-"}</td>
                        <td data-label="Aula">{registro.nombre_aula || "Sin aula"}</td>
                        <td data-label="Edificio">{registro.edificio || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {historial.length > registrosPorPagina && (
              <div className="paginacion">
                <button
                  className="btn-paginacion"
                  onClick={paginaAnterior}
                  disabled={paginaActual === 1}
                >
                  Anterior
                </button>

                <span className="pagina-actual">
                  Página {paginaActual} de {totalPaginas}
                </span>

                <button
                  className="btn-paginacion"
                  onClick={paginaSiguiente}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default HistorialMaestros;
