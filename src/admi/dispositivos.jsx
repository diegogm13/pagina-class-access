import React, { useEffect, useState } from "react";
import MenuAdmin from "./menuAdmi";
import "../styles/dispositivos.css";
import { useNavigate } from "react-router-dom";

const Dispositivos = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if(!usuario) {
      navigate("/");
    }
  }, [navigate]);

  const [dispositivos, setDispositivos] = useState([]);
  const [nuevoDispositivo, setNuevoDispositivo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  const obtenerDispositivos = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://servidor-class-access.vercel.app/api/dispositivos");
      const data = await response.json();
      setDispositivos(data);
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener dispositivos:", err);
      setError("Error al cargar los dispositivos");
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerDispositivos();
  }, []);

  const agregarDispositivo = async (e) => {
    e.preventDefault();
    if (nuevoDispositivo.trim() === "") {
      alert("Por favor ingresa un nombre válido para el dispositivo");
      return;
    }

    try {
      const response = await fetch("https://servidor-class-access.vercel.app/api/dispositivos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_dis: nuevoDispositivo })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNuevoDispositivo("");
        await obtenerDispositivos();
        setPaginaActual(1); // Volver a la primera página
      } else {
        alert(data.message || "Error al agregar dispositivo");
      }
    } catch (err) {
      console.error("Error al agregar dispositivo:", err);
      alert("Error al conectar con el servidor");
    }
  };

  const cambiarEstatus = async (id, estatus) => {
    const confirmMsg = estatus === 0 
      ? "¿Seguro que quieres desactivar este dispositivo?" 
      : "¿Seguro que quieres activar este dispositivo?";
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch(`https://servidor-class-access.vercel.app/api/dispositivos/${id}/estatus`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await obtenerDispositivos();
      } else {
        alert(data.message || "Error al cambiar el estatus");
      }
    } catch (err) {
      console.error("Error al cambiar estatus:", err);
      alert("Error al conectar con el servidor");
    }
  };

  // Calcular índices para la paginación
  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const dispositivosActuales = dispositivos.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(dispositivos.length / registrosPorPagina);

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

  if (loading) return <div className="loading">Cargando dispositivos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-administrador">
      <MenuAdmin />
      <main className="contenido-administrador dispositivos-container">
        <div className="dispositivos-header">
          <h1>Gestión de Dispositivos</h1>
        </div>

        <form className="form-dispositivo" onSubmit={agregarDispositivo}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Nombre del dispositivo"
              value={nuevoDispositivo}
              onChange={(e) => setNuevoDispositivo(e.target.value)}
              required
              className="input-nuevo-dispositivo"
            />
            <button type="submit" className="btn-agregar">
              <i className="icon-plus"></i> Agregar
            </button>
          </div>
        </form>

        {dispositivos.length > 0 && (
          <div className="info-registros">
            <p>Mostrando {indicePrimero + 1} - {Math.min(indiceUltimo, dispositivos.length)} de {dispositivos.length} dispositivos</p>
          </div>
        )}

        <div className="table-responsive" style={{ overflow: 'visible' }}>
          {dispositivos.length > 0 ? (
            <>
              <table className="dispositivos-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>ID</th>
                    <th style={{ width: '40%' }}>Nombre</th>
                    <th style={{ width: '20%' }}>Estatus</th>
                    <th style={{ width: '25%' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {dispositivosActuales.map(dis => (
                    <tr key={dis.id_dispositivo}>
                      <td data-label="ID">{dis.id_dispositivo}</td>
                      <td data-label="Nombre">{dis.nombre_dis}</td>
                      <td data-label="Estatus">
                        <span className={`estatus ${dis.estatus_dis === 1 ? 'activo' : 'inactivo'}`}>
                          {dis.estatus_dis === 1 ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td data-label="Acciones">
                        <button 
                          onClick={() => cambiarEstatus(dis.id_dispositivo, dis.estatus_dis === 1 ? 0 : 1)}
                          className={`btn-estatus ${dis.estatus_dis === 1 ? 'desactivar' : 'activar'}`}
                        >
                          {dis.estatus_dis === 1 ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPaginas > 1 && (
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
          ) : (
            <div className="no-results">
              <p>No hay dispositivos registrados</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dispositivos;