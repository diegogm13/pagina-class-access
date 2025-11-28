import React, { useEffect, useState } from "react";
import MenuAdmin from "./menuAdmi";
import "../styles/aulas.css";
import { useNavigate } from "react-router-dom";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  return null;
};

const Aulas = () => {
  const navigate = useNavigate();
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  const [aulas, setAulas] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [nombreAula, setNombreAula] = useState("");
  const [edificio, setEdificio] = useState("");
  const [idDispositivo, setIdDispositivo] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  // Validar usuario desde cookie
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

  // OBTENER DISPOSITIVOS (usando cookies)
  const obtenerDispositivos = async () => {
    try {
      const res = await fetch("https://classaccess-backend.vercel.app/api/devices", {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Solo activos
        const activos = data.data.filter(d => d.estatus_dis === true);
        setDispositivos(activos);
      } else {
        setDispositivos([]);
      }
    } catch (err) {
      console.error(err);
      setDispositivos([]);
    }
  };

  // OBTENER AULAS (usando cookies)
  const obtenerAulas = async () => {
    try {
      const res = await fetch("https://classaccess-backend.vercel.app/api/classrooms", {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAulas(data.data);
      } else {
        setAulas([]);
      }
    } catch (err) {
      console.error(err);
      setAulas([]);
    }
  };

  useEffect(() => {
    if (usuarioLogueado) {
      obtenerDispositivos();
      obtenerAulas();
    }
  }, [usuarioLogueado]);

  const limpiarFormulario = () => {
    setNombreAula("");
    setEdificio("");
    setIdDispositivo("");
    setEditandoId(null);
  };

  const validarDispositivo = () => {
    if (!idDispositivo) return true;
    const dispositivoEnUso = aulas.find(
      a => a.id_dispositivo === parseInt(idDispositivo) && a.id_aula !== editandoId
    );
    return !dispositivoEnUso;
  };

  const guardarAula = async (e) => {
    e.preventDefault();

    if (!nombreAula.trim() || !edificio.trim()) {
      return alert("Completa todos los campos obligatorios");
    }

    if (!validarDispositivo()) {
      return alert("Este dispositivo ya se encuentra asignado a otra aula");
    }

    const datos = {
      nombre_aula: nombreAula,
      edificio,
      id_dispositivo: idDispositivo ? parseInt(idDispositivo) : null
    };

    const url = editandoId
      ? `https://classaccess-backend.vercel.app/api/classrooms/${editandoId}`
      : "https://classaccess-backend.vercel.app/api/classrooms";

    const metodo = editandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(datos)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        limpiarFormulario();
        obtenerAulas();
        setPaginaActual(1);
      } else if (data.errors) {
        const mensajes = data.errors.map(err => err.msg).join("\n");
        alert(mensajes);
      } else {
        alert(data.message || "Error al guardar aula");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  const editarAula = (aula) => {
    setNombreAula(aula.nombre_aula);
    setEdificio(aula.edificio);
    setIdDispositivo(aula.id_dispositivo || "");
    setEditandoId(aula.id_aula);
  };

  // Paginación
  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const aulasActuales = aulas.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(aulas.length / registrosPorPagina);

  if (!usuarioLogueado) return <div className="loading">Validando sesión...</div>;

  return (
    <div className="dashboard-administrador">
      <MenuAdmin />
      <main className="contenido-administrador aulas-container">
        <div className="aulas-header">
          <h1>Gestión de Aulas</h1>
        </div>

        <form className="form-aula" onSubmit={guardarAula}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombre-aula">Nombre del aula</label>
              <input
                id="nombre-aula"
                type="text"
                placeholder="Ej. Aula 101"
                value={nombreAula}
                onChange={(e) => setNombreAula(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edificio">Edificio</label>
              <input
                id="edificio"
                type="text"
                placeholder="Ej. Edificio A"
                value={edificio}
                onChange={(e) => setEdificio(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dispositivo">Dispositivo</label>
              <select
                id="dispositivo"
                value={idDispositivo}
                onChange={(e) => setIdDispositivo(e.target.value)}
              >
                <option value="">Sin dispositivo</option>
                {dispositivos.map(dis => (
                  <option key={dis.id_dispositivo} value={dis.id_dispositivo}>
                    {dis.nombre_dis} (ID: {dis.id_dispositivo})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-guardar">
              {editandoId ? "Actualizar Aula" : "Agregar Aula"}
            </button>
            {editandoId && (
              <button 
                type="button" 
                className="btn-guardar"
                onClick={limpiarFormulario}
                style={{ color: "#ffffff" }}
              >
                Cancelar
              </button>


            )}
          </div>
        </form>

        {aulas.length > 0 && (
          <div className="info-registros">
            <p>Mostrando {indicePrimero + 1} - {Math.min(indiceUltimo, aulas.length)} de {aulas.length} aulas</p>
          </div>
        )}

        <div className="table-responsive">
          {aulas.length > 0 ? (
            <table className="aulas-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Edificio</th>
                  <th>Dispositivo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {aulasActuales.map(a => (
                  <tr key={a.id_aula}>
                    <td data-label="ID">{a.id_aula}</td>
                    <td data-label="Nombre">{a.nombre_aula}</td>
                    <td data-label="Edificio">{a.edificio}</td>
                    <td data-label="Dispositivo">
                      {a.id_dispositivo ? (
                        <span className="dispositivo-asignado">
                          {dispositivos.find(d => d.id_dispositivo === a.id_dispositivo)?.nombre_dis}
                        </span>
                      ) : (
                        <span className="sin-dispositivo">Sin dispositivo</span>
                      )}
                    </td>
                    <td data-label="Acciones">
                      <button 
                        onClick={() => editarAula(a)}
                        className="btn-editar"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              <p>No hay aulas registradas</p>
            </div>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="paginacion">
            <button className="btn-paginacion" onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1}>
              Anterior
            </button>
            <span className="pagina-actual">
              Página {paginaActual} de {totalPaginas}
            </span>
            <button className="btn-paginacion" onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}>
              Siguiente
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Aulas;
