import React, { useEffect, useState } from "react";
import MenuAdmin from "./menuAdmi";
import "../styles/dispositivos.css";
import { useNavigate } from "react-router-dom";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  return null;
};

const Dispositivos = () => {
  const navigate = useNavigate();
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");

  // Validar sesión
  useEffect(() => {
    const userDataCookie = getCookie("userData");
    if (userDataCookie) {
      try {
        setUsuarioLogueado(JSON.parse(userDataCookie));
      } catch {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  // OBTENER DISPOSITIVOS
  const obtenerDispositivos = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://classaccess-backend.vercel.app/api/devices", {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Error del servidor");

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setDispositivos(result.data);
      } else {
        setDispositivos([]);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar dispositivos");
      setDispositivos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuarioLogueado) obtenerDispositivos();
  }, [usuarioLogueado]);

  // AGREGAR DISPOSITIVO
  const agregarDispositivo = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return alert("El nombre es obligatorio");

    try {
      const response = await fetch("https://classaccess-backend.vercel.app/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nombre_dis: nuevoNombre.trim(),       // ← nombre exacto de tu API
          descripcion: nuevaDescripcion.trim() || "Sin descripción",
          estatus_dis: true,                     // ← nombre exacto de tu API
        }),
      });

      const res = await response.json();

      if (response.ok && res.success) {
        setNuevoNombre("");
        setNuevaDescripcion("");
        obtenerDispositivos();
        alert("Dispositivo agregado correctamente");
      } else if (res.errors) {
        // Manejo de errores de validación
        const mensajes = res.errors.map((err) => err.msg).join("\n");
        alert(mensajes);
      } else {
        alert(res.message || "Error al agregar dispositivo");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  // CAMBIAR ESTATUS
  const cambiarEstatus = async (id, estatusActual) => {
    const nuevoEstatus = !estatusActual;

    if (!window.confirm(`¿Deseas ${nuevoEstatus ? "activar" : "desactivar"} este dispositivo?`)) return;

    try {
      const response = await fetch(`https://classaccess-backend.vercel.app/api/devices/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ estatus_dis: nuevoEstatus }),
      });

      if (response.ok) {
        obtenerDispositivos();
      } else {
        const error = await response.json();
        alert(error.message || "Error al cambiar el estatus");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  // Paginación
  const totalPaginas = Math.ceil(dispositivos.length / registrosPorPagina);
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const actuales = dispositivos.slice(inicio, inicio + registrosPorPagina);

  if (!usuarioLogueado) return <div className="loading">Validando sesión...</div>;
  if (loading) return <div className="loading">Cargando dispositivos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-administrador">
      <MenuAdmin />
      <main className="contenido-administrador dispositivos-container">
        <h1>Gestión de Dispositivos</h1>

            <form className="form-dispositivo" onSubmit={agregarDispositivo}>
        <div className="input-group">
          <input
            type="text"
            placeholder="Nombre del dispositivo"
            className="input-nuevo-dispositivo"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            className="input-nuevo-dispositivo"
            value={nuevaDescripcion}
            onChange={(e) => setNuevaDescripcion(e.target.value)}
          />
          <button type="submit" className="btn-agregar">
            Agregar Dispositivo
          </button>
        </div>
      </form>

        {dispositivos.length > 0 ? (
          <>
            <div className="info-registros">
              <p>
                Mostrando {inicio + 1} - {Math.min(inicio + registrosPorPagina, dispositivos.length)} de {dispositivos.length}
              </p>
            </div>

            <table className="dispositivos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {actuales.map((dis) => (
                  <tr key={dis.id_dispositivo}>
                    <td>{dis.id_dispositivo}</td>
                    <td>{dis.nombre_dis}</td>
                    <td>
                      <span className={`estatus ${dis.estatus_dis ? "activo" : "inactivo"}`}>
                        {dis.estatus_dis ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => cambiarEstatus(dis.id_dispositivo, dis.estatus_dis)}
                        className={`btn-estatus ${dis.estatus_dis ? "desactivar" : "activar"}`}
                      >
                        {dis.estatus_dis ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPaginas > 1 && (
              <div className="paginacion">
                <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1}>
                  Anterior
                </button>
                <span>
                  Página {paginaActual} de {totalPaginas}
                </span>
                <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}>
                  Siguiente
                </button>
              </div>
            )}
          </>
        ) : (
          <p>No hay dispositivos registrados</p>
        )}
      </main>
    </div>
  );
};

export default Dispositivos;
