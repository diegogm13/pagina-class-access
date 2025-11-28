import React, { useEffect, useState } from "react";
import MenuAdmin from "./menuAdmi";
import "../styles/asistencia.css";
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

// 🔹 Función para procesar promesas en lotes
const processInBatches = async (items, batchSize, callback) => {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(callback));
    results.push(...batchResults);
  }
  return results;
};

const Asistencias = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [fecha, setFecha] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  // 🔹 Validar sesión
  useEffect(() => {
    const userDataCookie = getCookie("userData");
    if (userDataCookie) {
      try {
        const usuario = JSON.parse(userDataCookie);
        setUsuario(usuario);
      } catch (error) {
        console.error("Error al parsear userData:", error);
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  // 🔹 Obtener asistencias
  const obtenerAsistencias = async () => {
    try {
      setLoading(true);

      // 1️⃣ Obtener todos los usuarios
      const responseUsuarios = await fetch("https://classaccess-backend.vercel.app/api/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const dataUsuarios = await responseUsuarios.json();

      if (!dataUsuarios.success) throw new Error("Error al obtener usuarios");

      const todosLosUsuarios = [
        ...dataUsuarios.data.alumnos,
        ...dataUsuarios.data.maestros,
        ...dataUsuarios.data.administradores,
      ];

      // 2️⃣ Obtener historial de usuarios en lotes de 10
      const resultados = await processInBatches(todosLosUsuarios, 10, async (user) => {
        try {
          const responseHistory = await fetch(
            `https://classaccess-backend.vercel.app/api/students/${user.id_usu}/history`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            }
          );
          const dataHistory = await responseHistory.json();

          if (dataHistory.success && dataHistory.data) {
            return dataHistory.data.map((registro) => ({
              ...registro,
              nombre_usu: user.nombre_usu,
              ap_usu: user.ap_usu,
              am_usu: user.am_usu,
              correo_usu: user.correo_usu,
              priv_usu: user.priv_usu,
              id_usu: user.id_usu,
            }));
          }
          return [];
        } catch (err) {
          console.error(`Error usuario ${user.id_usu}:`, err);
          return [];
        }
      });

      const todasLasAsistencias = resultados.flat();

      // 3️⃣ Ordenar por fecha y hora más reciente
      todasLasAsistencias.sort((a, b) => {
        const fechaA = new Date(a.fecha + "T" + a.hora_entrada);
        const fechaB = new Date(b.fecha + "T" + b.hora_entrada);
        return fechaB - fechaA;
      });

      setAsistencias(todasLasAsistencias);
      setPaginaActual(1);
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener asistencias:", err);
      setError("Error al cargar las asistencias");
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerAsistencias();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPaginaActual(1);
  };

  const limpiarFiltros = () => {
    setFecha("");
    setBusqueda("");
    setPaginaActual(1);
  };

  const hayFiltrosActivos = fecha !== "" || busqueda !== "";

  const asistenciasFiltradas = asistencias.filter((asistencia) => {
    const coincideFecha = fecha === "" || new Date(asistencia.fecha).toISOString().split("T")[0] === fecha;
    const coincideBusqueda =
      busqueda === "" ||
      asistencia.nombre_usu.toLowerCase().includes(busqueda.toLowerCase()) ||
      asistencia.ap_usu.toLowerCase().includes(busqueda.toLowerCase()) ||
      asistencia.am_usu.toLowerCase().includes(busqueda.toLowerCase()) ||
      asistencia.correo_usu.toLowerCase().includes(busqueda.toLowerCase()) ||
      asistencia.id_usu.toString().includes(busqueda) ||
      (asistencia.grupo && asistencia.grupo.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideFecha && coincideBusqueda;
  });

  // Mostrar solo último registro por usuario si no hay filtros
  let registrosAMostrar = asistenciasFiltradas;
  if (!hayFiltrosActivos) {
    const usuariosUnicos = {};
    asistenciasFiltradas.forEach((asistencia) => {
      if (!usuariosUnicos[asistencia.id_usu]) usuariosUnicos[asistencia.id_usu] = asistencia;
    });
    registrosAMostrar = Object.values(usuariosUnicos);
  }

  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const registrosActuales = registrosAMostrar.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(registrosAMostrar.length / registrosPorPagina);

  const paginaSiguiente = () => paginaActual < totalPaginas && setPaginaActual(paginaActual + 1);
  const paginaAnterior = () => paginaActual > 1 && setPaginaActual(paginaActual - 1);

  if (!usuario) return <div className="loading">Validando sesión...</div>;
  if (loading) return <div className="loading">Cargando asistencias...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-administrador">
      <MenuAdmin />
      <main className="contenido-administrador asistencia-container">
        <div className="asistencia-header">
          <h1>Historial de Asistencias</h1>
          {!hayFiltrosActivos && <p className="info-vista">Usa los filtros para ver el historial completo.</p>}
        </div>

        <div className="filtros-container">
          <form className="filtros-form" onSubmit={handleSubmit}>
            <div className="filtro-group">
              <label htmlFor="fecha">Filtrar por fecha:</label>
              <input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => { setFecha(e.target.value); setPaginaActual(1); }}
                className="input-filtro"
              />
            </div>

            <div className="filtro-group">
              <label htmlFor="busqueda">Buscar:</label>
              <input
                id="busqueda"
                type="text"
                placeholder="Nombre, correo, ID o grupo"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                className="input-filtro"
              />
            </div>

            <div className="filtro-actions">
              <button type="button" className="btn-limpiar" onClick={limpiarFiltros}>
                <i className="icon-clear"></i> Limpiar
              </button>
            </div>
          </form>
        </div>

        {registrosAMostrar.length > 0 && (
          <div className="info-registros">
            <p>
              Mostrando {indicePrimero + 1} - {Math.min(indiceUltimo, registrosAMostrar.length)} de {registrosAMostrar.length} registros
              {hayFiltrosActivos && " (historial completo)"}
            </p>
          </div>
        )}

        <div className="table-responsive" style={{ overflow: "visible" }}>
          {registrosAMostrar.length > 0 ? (
            <>
              <table className="asistencias-table" style={{ tableLayout: "fixed", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: "18%" }}>Nombre</th>
                    <th style={{ width: "16%" }}>Correo</th>
                    <th style={{ width: "12%" }}>Edificio</th>
                    <th style={{ width: "12%" }}>Aula</th>
                    <th style={{ width: "10%" }}>Grupo</th>
                    <th style={{ width: "16%" }}>Entrada</th>
                    <th style={{ width: "16%" }}>Salida</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosActuales.map((a) => (
                    <tr key={`${a.id_registro}-${a.id_usu}`}>
                      <td data-label="Nombre">{`${a.nombre_usu} ${a.ap_usu} ${a.am_usu}`}</td>
                      <td data-label="Correo">{a.correo_usu}</td>
                      <td data-label="Edificio">{a.edificio || "N/A"}</td>
                      <td data-label="Aula">{a.nombre_aula || "N/A"}</td>
                      <td data-label="Grupo">{a.priv_usu === 1 ? <span className="badge grupo">{a.grupo || "Sin grupo"}</span> : "N/A"}</td>
                      <td data-label="Entrada"><span className="hora entrada">{a.hora_entrada ? a.hora_entrada.split(".")[0] : "-"}</span></td>
                      <td data-label="Salida">{a.hora_salida ? <span className="hora salida">{a.hora_salida.split(".")[0]}</span> : <span className="sin-salida">Sin salida</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="paginacion">
                <button className="btn-paginacion" onClick={paginaAnterior} disabled={paginaActual === 1}>Anterior</button>
                <span className="pagina-actual">Página {paginaActual} de {totalPaginas}</span>
                <button className="btn-paginacion" onClick={paginaSiguiente} disabled={paginaActual === totalPaginas}>Siguiente</button>
              </div>
            </>
          ) : (
            <div className="no-results">
              <p>No se encontraron asistencias con los filtros aplicados</p>
              <button className="btn-limpiar" onClick={limpiarFiltros}>Limpiar filtros</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Asistencias;
