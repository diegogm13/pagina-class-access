import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/maestro.css";
import "../styles/historialMaestro.css";
import MenuMaestro from "./menuMaestro";
import { useNavigate } from "react-router-dom";

const HistorialMaestros = () => {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;
  const id_usu = localStorage.getItem("id_usu");

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (!usuario) navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (!id_usu) return;

    setCargando(true);
    axios
      .get(`https://servidor-class-access.vercel.app/api/alumno/historial/${id_usu}`)
      .then((res) => {
        setHistorial(res.data || []);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al obtener historial:", err);
        setCargando(false);
      });
  }, [id_usu]);

  // --- FORMATEAR FECHA SIN RESTAR UN DÍA (EVITA new Date) ---
  const formatFecha = (fecha) => {
    if (!fecha) return "-";

    const str = String(fecha).trim();

    // Detecta tanto "2025-11-27" como "2025-11-27T00:00:00.000Z"
    const match = str.match(/^(\d{4}-\d{2}-\d{2})/);

    if (match) {
      const [yyyy, mm, dd] = match[1].split("-");
      return `${dd}/${mm}/${yyyy}`;
    }

    return str; // fallback
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
                        <td data-label="Fecha">
                          {formatFecha(registro.fecha)}
                        </td>

                        <td data-label="Entrada">
                          {registro.hora_entrada ? registro.hora_entrada.split(".")[0] : "-"}
                        </td>

                        <td data-label="Salida">
                          {registro.hora_salida ? registro.hora_salida.split(".")[0] : "-"}
                        </td>

                        <td data-label="Aula">
                          {registro.nombre_aula || "Sin aula"}
                        </td>

                        <td data-label="Edificio">
                          {registro.edificio || "-"}
                        </td>
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
