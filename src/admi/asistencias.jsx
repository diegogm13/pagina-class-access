import React, { useEffect, useState } from "react";
import MenuAdmin from "./menuAdmi";
import "../styles/asistencia.css";
import { useNavigate } from "react-router-dom";

const Asistencias = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (!usuario) {
      navigate("/");
    }
  }, [navigate]);
        
  const [asistencias, setAsistencias] = useState([]);
  const [fecha, setFecha] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  const obtenerAsistencias = async () => {
    try {
      setLoading(true);
      const url = new URL("https://servidor-class-access.vercel.app/api/asistencias");
      if (fecha) url.searchParams.append("fecha", fecha);
      if (busqueda) url.searchParams.append("busqueda", busqueda);

      const response = await fetch(url);
      const data = await response.json();
      setAsistencias(data);
      setPaginaActual(1); // Reiniciar a página 1 al filtrar
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
    obtenerAsistencias();
  };

  const limpiarFiltros = () => {
    setFecha("");
    setBusqueda("");
    setPaginaActual(1);
    obtenerAsistencias();
  };

  // Calcular índices para la paginación
  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const registrosActuales = asistencias.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(asistencias.length / registrosPorPagina);

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  if (loading) return <div className="loading">Cargando asistencias...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-administrador">
      <MenuAdmin />
      <main className="contenido-administrador asistencia-container">
        <div className="asistencia-header">
          <h1>Historial de Asistencias</h1>
        </div>

        <div className="filtros-container">
          <form className="filtros-form" onSubmit={handleSubmit}>
            <div className="filtro-group">
              <label htmlFor="fecha">Filtrar por fecha:</label>
              <input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="input-filtro"
              />
            </div>
            
            <div className="filtro-group">
              <label htmlFor="busqueda">Buscar:</label>
              <input
                id="busqueda"
                type="text"
                placeholder="Matrícula o No. Empleado"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-filtro"
              />
            </div>
            
            <div className="filtro-actions">
              <button type="submit" className="btn-filtrar">
                <i className="icon-search"></i> Buscar
              </button>
              <button 
                type="button" 
                className="btn-limpiar"
                onClick={limpiarFiltros}
              >
                <i className="icon-clear"></i> Limpiar
              </button>
            </div>
          </form>
        </div>

        {asistencias.length > 0 && (
          <div className="info-registros">
            <p>Mostrando {indicePrimero + 1} - {Math.min(indiceUltimo, asistencias.length)} de {asistencias.length} registros</p>
          </div>
        )}

        <div className="table-responsive" style={{ overflow: 'visible' }}>
          {asistencias.length > 0 ? (
            <>
              <table className="asistencias-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '18%' }}>Nombre</th>
                    <th style={{ width: '16%' }}>Correo</th>
                    <th style={{ width: '12%' }}>Edificio</th>
                    <th style={{ width: '12%' }}>Aula</th>
                    <th style={{ width: '10%' }}>Grupo</th>
                    <th style={{ width: '16%' }}>Entrada</th>
                    <th style={{ width: '16%' }}>Salida</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosActuales.map((a) => (
                    <tr key={a.id_registro}>
                      <td data-label="Nombre">{`${a.nombre_usu} ${a.ap_usu} ${a.am_usu}`}</td>
                      <td data-label="Correo">{a.correo_usu}</td>
                      <td data-label="Edificio">{a.edificio}</td>
                      <td data-label="Aula">{a.nombre_aula}</td>
                      <td data-label="Grupo">
                        {a.priv_usu === 1 ? (
                          <span className="badge grupo">{a.grupo}</span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td data-label="Entrada">
                        <span className="hora entrada">
                          {a.hora_entrada ? a.hora_entrada.split('.')[0] : '-'}
                        </span>
                      </td>
                      <td data-label="Salida">
                        {a.hora_salida ? (
                          <span className="hora salida">
                            {a.hora_salida.split('.')[0]}
                          </span>
                        ) : (
                          <span className="sin-salida">Sin salida</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
            </>
          ) : (
            <div className="no-results">
              <p>No se encontraron asistencias con los filtros aplicados</p>
              <button 
                className="btn-limpiar"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Asistencias;