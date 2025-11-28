import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/historialAlumno.css";
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

const HistorialAlumno = () => {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 6;
  const [idUsuario, setIdUsuario] = useState(null);

  useEffect(() => {
    // 🍪 Obtener datos del usuario desde la cookie
    const userDataCookie = getCookie("userData");

    if (!userDataCookie) {
      navigate("/");
      return;
    }

    try {
      const usuario = JSON.parse(userDataCookie);
      if (!usuario || !usuario.id_usu) {
        navigate("/");
        return;
      }
      setIdUsuario(usuario.id_usu);
    } catch (error) {
      console.error("Error al parsear userData:", error);
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!idUsuario) return;

    const fetchHistorial = async () => {
      setCargando(true);
      setError(null);

      try {
        // 🍪 CRÍTICO: Agregar withCredentials para enviar cookies
        const response = await axios.get(
          `https://classaccess-backend.vercel.app/api/students/${idUsuario}/history`,
          {
            withCredentials: true, // 🍪 Equivalente a credentials: 'include' en fetch
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        // Manejar diferentes estructuras de respuesta
        const data = response.data.data || response.data;
        setHistorial(Array.isArray(data) ? data : []);
        
      } catch (err) {
        console.error("Error al obtener historial:", err);
        
        if (err.response?.status === 401) {
          // Token expirado o inválido
          setError("Sesión expirada. Redirigiendo al login...");
          setTimeout(() => navigate("/"), 2000);
        } else if (err.response?.status === 403) {
          setError("No tienes permiso para ver este historial");
        } else {
          setError("Error al cargar el historial. Intenta de nuevo.");
        }
      } finally {
        setCargando(false);
      }
    };

    fetchHistorial();
  }, [idUsuario, navigate]);

  // Helper para formatear la fecha SIN convertir a Date (evita problemas de zona horaria)
  const formatFecha = (fecha) => {
    if (!fecha && fecha !== 0) return "-";
    const str = String(fecha).trim();

    // Formato YYYY-MM-DD
    const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      const parts = match[1].split("-");
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    // Formato YYYY/MM/DD
    const altMatch = str.match(/^(\d{4}\/\d{2}\/\d{2})/);
    if (altMatch) {
      const parts = altMatch[1].split("/");
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return str || "-";
  };

  const formatHora = (hora) => {
    if (!hora) return "-";
    // Eliminar milisegundos si existen
    return String(hora).split(".")[0];
  };

  // Paginación
  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const registrosActuales = historial.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.max(1, Math.ceil(historial.length / registrosPorPagina));

  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);
  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) setPaginaActual(p => p + 1);
  };
  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(p => p - 1);
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
        ) : error ? (
          <div className="error-historial">
            <p className="mensaje-error">⚠️ {error}</p>
          </div>
        ) : historial.length === 0 ? (
          <div className="sin-registros">
            <p>No se encontraron registros de asistencia</p>
            <small>Cuando registres tu asistencia, aparecerá aquí</small>
          </div>
        ) : (
          <>
            <div className="info-registros">
              <p>
                Mostrando {indicePrimero + 1} - {Math.min(indiceUltimo, historial.length)} de {historial.length} registros
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
                    <tr key={registro.id_registro || index}>
                      <td 
                        data-label="Fecha" 
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {formatFecha(registro.fecha)}
                      </td>
                      <td 
                        data-label="Entrada" 
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {formatHora(registro.hora_entrada)}
                      </td>
                      <td 
                        data-label="Salida" 
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {formatHora(registro.hora_salida)}
                      </td>
                      <td 
                        data-label="Aula" 
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {registro.nombre_aula || "Sin aula"}
                      </td>
                      <td 
                        data-label="Edificio" 
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {registro.edificio || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="paginacion">
              <button 
                className="btn-paginacion" 
                onClick={paginaAnterior} 
                disabled={paginaActual === 1}
              >
                ← Anterior
              </button>

              <span className="pagina-actual">
                Página {paginaActual} de {totalPaginas}
              </span>

              <button 
                className="btn-paginacion" 
                onClick={paginaSiguiente} 
                disabled={paginaActual === totalPaginas}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default HistorialAlumno;