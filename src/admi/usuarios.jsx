import React, { useEffect, useState } from "react";
import "../styles/usuarios.css";
import { useNavigate } from "react-router-dom";
import MenuAdmin from "./menuAdmi";
import axios from "axios";

// 🍪 Utilidad para obtener cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(";").shift());
  }
  return null;
};

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;
  const navigate = useNavigate();
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  // Validar usuario desde cookie
  useEffect(() => {
    const userDataCookie = getCookie("userData");
    if (userDataCookie) {
      try {
        const usuario = JSON.parse(userDataCookie);
        
        // Verificar que sea administrador (priv_usu = 3)
        if (usuario.priv_usu !== 3) {
          console.warn("Usuario no es administrador");
          navigate("/");
          return;
        }
        
        setUsuarioLogueado(usuario);
      } catch (err) {
        console.error("Error al parsear userData:", err);
        navigate("/");
      }
    } else {
      console.warn("No hay cookie de sesión");
      navigate("/");
    }
  }, [navigate]);

  // Obtener usuarios desde la nueva API
  useEffect(() => {
    if (!usuarioLogueado) return;

    const fetchUsuarios = async () => {
      try {
        console.log("🔍 Obteniendo usuarios...");
        
        const response = await axios.get("/api/users", {
          withCredentials: true, // 🔑 Importante: envía las cookies
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log("✅ Respuesta de usuarios:", response.data);

        // La respuesta viene en formato { success: true, data: {...} }
        let usuariosData;
        if (response.data.success && response.data.data) {
          usuariosData = response.data.data;
        } else if (response.data.alumnos) {
          // Si viene en el formato antiguo
          usuariosData = response.data;
        } else {
          throw new Error("Formato de respuesta inválido");
        }

        // Combinar todos los tipos de usuarios
        const combinados = [
          ...(usuariosData.alumnos || []).map(u => ({ ...u, tipo: "alumno" })),
          ...(usuariosData.maestros || []).map(u => ({ ...u, tipo: "maestro" })),
          ...(usuariosData.administradores || []).map(u => ({ ...u, tipo: "administrador" }))
        ];

        console.log(`Total de usuarios cargados: ${combinados.length}`);
        setUsuarios(combinados);
        setLoading(false);
        setError(null);

      } catch (err) {
        console.error("❌ Error al obtener usuarios:", err);
        console.error("Detalles:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });

        if (err.response) {
          const status = err.response.status;
          
          if (status === 401) {
            setError("Sesión expirada. Redirigiendo al login...");
            setTimeout(() => navigate("/"), 2000);
          } else if (status === 403) {
            setError("No tienes permiso para ver esta información");
          } else {
            setError(err.response.data?.message || "Error al cargar los usuarios");
          }
        } else if (err.request) {
          setError("No se pudo conectar con el servidor");
        } else {
          setError("Error al procesar la solicitud");
        }

        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [usuarioLogueado, navigate]);

  // Cambiar estatus de usuario
  const cambiarEstatus = async (id, nuevoEstatus) => {
    try {
      console.log(`🔄 Cambiando estatus del usuario ${id} a ${nuevoEstatus}`);

      const response = await axios.put(
        `/api/users/${id}/status`,
        { estatus: nuevoEstatus },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Estatus actualizado:", response.data);

      // Actualizar el estado local
      setUsuarios(prev =>
        prev.map(u => u.id_usu === id ? { ...u, estatus_usu: nuevoEstatus } : u)
      );

      // Mostrar mensaje de éxito (opcional)
      alert(nuevoEstatus === 1 
        ? "Usuario activado correctamente" 
        : "Usuario desactivado correctamente"
      );

    } catch (err) {
      console.error("❌ Error al cambiar estatus:", err);
      console.error("Detalles:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message;

        if (status === 401) {
          alert("Sesión expirada. Redirigiendo al login...");
          setTimeout(() => navigate("/"), 2000);
        } else if (status === 403) {
          alert("No tienes permiso para realizar esta acción");
        } else if (status === 404) {
          alert("Usuario no encontrado");
        } else {
          alert(message || "No se pudo actualizar el estatus del usuario");
        }
      } else {
        alert("Error de conexión con el servidor");
      }
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(u => {
    const nombreCompleto = `${u.nombre_usu} ${u.ap_usu} ${u.am_usu}`.toLowerCase();
    const coincideBusqueda = nombreCompleto.includes(busqueda.toLowerCase()) || 
                           u.correo_usu.toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = tipoFiltro === "todos" || u.tipo === tipoFiltro;
    return coincideBusqueda && coincideTipo;
  });

  // Paginación
  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const usuariosActuales = usuariosFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / registrosPorPagina);

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  // Reiniciar a página 1 cuando cambian filtros
  useEffect(() => { 
    setPaginaActual(1); 
  }, [tipoFiltro, busqueda]);

  // Estados de carga
  if (!usuarioLogueado) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Validando sesión...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-administrador">
        <MenuAdmin />
        <main className="contenido-administrador">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Error al cargar usuarios</h2>
            <p>{error}</p>
            <button 
              className="btn-reintentar"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-administrador">
      <MenuAdmin />

      <main className="contenido-administrador usuarios-container">
        <div className="usuarios-header">
          <div className="titulo-seccion-container">
            <h1>Gestión de Usuarios</h1>
            <p className="subtitulo">Administra todos los usuarios del sistema</p>
          </div>
          <button 
            onClick={() => navigate("/registro")} 
            className="btn-agregar"
          >
            <span className="icon-plus">➕</span> Agregar Usuario
          </button>
        </div>

        <div className="filtros-container">
          <form className="filtros" onSubmit={e => e.preventDefault()}>
            <div className="filtro-group">
              <label htmlFor="tipo-filtro">Filtrar por tipo:</label>
              <select 
                id="tipo-filtro"
                value={tipoFiltro} 
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="select-filtro"
              >
                <option value="todos">Todos los usuarios</option>
                <option value="alumno">Alumnos</option>
                <option value="maestro">Maestros</option>
                <option value="administrador">Administradores</option>
              </select>
            </div>
            
            <div className="filtro-group">
              <label htmlFor="busqueda">Buscar:</label>
              <input
                id="busqueda"
                type="text"
                placeholder="Nombre o correo electrónico"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-busqueda"
              />
            </div>
          </form>
        </div>

        {usuariosFiltrados.length > 0 && (
          <div className="info-registros">
            <p>
              Mostrando <strong>{indicePrimero + 1}</strong> - <strong>{Math.min(indiceUltimo, usuariosFiltrados.length)}</strong> de <strong>{usuariosFiltrados.length}</strong> usuarios
            </p>
          </div>
        )}

        <div className="table-responsive" style={{ overflow: 'visible' }}>
          <table className="usuarios-table" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Nombre</th>
                <th style={{ width: '25%' }}>Correo</th>
                <th style={{ width: '15%' }}>Tipo</th>
                <th style={{ width: '15%' }}>Estatus</th>
                <th style={{ width: '20%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosActuales.length > 0 ? (
                usuariosActuales.map(u => (
                  <tr key={u.id_usu}>
                    <td data-label="Nombre">
                      {u.nombre_usu} {u.ap_usu} {u.am_usu}
                    </td>
                    <td data-label="Correo" className="email-cell">
                      {u.correo_usu}
                    </td>
                    <td data-label="Tipo">
                      <span className={`badge ${u.tipo}`}>
                        {u.tipo === "alumno"}
                        {u.tipo === "maestro"}
                        {u.tipo === "administrador"}
                        {u.tipo.charAt(0).toUpperCase() + u.tipo.slice(1)}
                      </span>
                    </td>
                      <td data-label="Estatus">
                        <span className={`estatus ${u.estatus_usu ? 'activo' : 'inactivo'}`}>
                          {u.estatus_usu ? "✓ Activo" : "✗ Inactivo"}
                        </span>
                      </td>
                      <td data-label="Acciones">
                        {u.tipo !== "administrador" ? (
                          <button 
                            onClick={() => cambiarEstatus(u.id_usu, !u.estatus_usu)}
                            className={`btn-estatus ${u.estatus_usu ? 'desactivar' : 'activar'}`}
                            title={u.estatus_usu ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            {u.estatus_usu ? "Desactivar" : "Activar"}
                          </button>
                        ) : (
                          <span className="sin-acciones" title="No se pueden modificar administradores">
                            Protegido
                          </span>
                        )}
                      </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-results">
                    <div className="no-results-content">
                      <span className="no-results-icon">🔍</span>
                      <p>No se encontraron usuarios con los filtros aplicados</p>
                      <button 
                        className="btn-limpiar-filtros"
                        onClick={() => {
                          setTipoFiltro("todos");
                          setBusqueda("");
                        }}
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {usuariosFiltrados.length > registrosPorPagina && (
            <div className="paginacion">
              <button 
                className="btn-paginacion"
                onClick={paginaAnterior}
                disabled={paginaActual === 1}
              >
                ← Anterior
              </button>

              <span className="pagina-actual">
                Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong>
              </span>

              <button 
                className="btn-paginacion"
                onClick={paginaSiguiente}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Usuarios;