import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/historialAlumno.css";
import MenuAlumno from "./menuAlumno";
import { useNavigate } from "react-router-dom";

const HistorialMaestros = () => {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 6;
  const id_usu = localStorage.getItem("id_usu");

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (!usuario) {
      navigate("/");
    }
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

  // Helper para formatear la fecha SIN convertir a Date (evita problemas de zona horaria)
  const formatFecha = (fecha) => {
    if (!fecha && fecha !== 0) return "-";
    const str = String(fecha).trim();

    // Busca un match YYYY-MM-DD al inicio (cubre ISO y fechas simples)
    const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      const parts = match[1].split("-");
      // parts = [YYYY, MM, DD] -> devolver DD/MM/YYYY
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    // Si no coincide con el patrón, intenta detectar YYYY/MM/DD
    const altMatch = str.match(/^(\d{4}\/\d{2}\/\d{2})/);
    if (altMatch) {
      const parts = altMatch[1].split("/");
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    // Fallback: devolver el string tal cual (o "-")
    return str || "-";
  };

  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const registrosActuales = historial.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.max(1, Math.ceil(historial.length / registrosPorPagina));

  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual((p) => p + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual((p) => p - 1);
    }
  };

  return (
    <div className="dashboard-maestro">
      <MenuAlumno />

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

            <div className="contenedor-tabla" style={{ overflow: "visible" }}>
              <table className="tabla-historial" style={{ tableLayout: "fixed", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: "20%" }}>Fecha</th>
                    <th style={{ width: "16%" }}>Entrada</th>
                    <th style={{ width: "16%" }}>Salida</th>
                    <th style={{ width: "24%" }}>Aula</th>
                    <th style={{ width: "24%" }}>Edificio</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosActuales.map((registro, index) => (
                    <tr key={index}>
                      {/* FECHA: usar formatFecha para evitar restar un día */}
                      <td data-label="Fecha" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {formatFecha(registro.fecha)}
                      </td>

                      <td data-label="Entrada" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {registro.hora_entrada ? String(registro.hora_entrada).split(".")[0] : "-"}
                      </td>

                      <td data-label="Salida" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {registro.hora_salida ? String(registro.hora_salida).split(".")[0] : "-"}
                      </td>

                      <td data-label="Aula" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {registro.nombre_aula || "Sin aula"}
                      </td>

                      <td data-label="Edificio" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {registro.edificio || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="paginacion">
              <button className="btn-paginacion" onClick={paginaAnterior} disabled={paginaActual === 1}>
                Anterior
              </button>

              <span className="pagina-actual">Página {paginaActual} de {totalPaginas}</span>

              <button
                className="btn-paginacion"
                onClick={paginaSiguiente}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default HistorialMaestros;
