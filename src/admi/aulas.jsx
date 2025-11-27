import React, { useEffect, useState } from "react";
import MenuAdmin from "./menuAdmi";
import "../styles/aulas.css"
import { useNavigate } from "react-router-dom";

const Aulas = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if(!usuario) {
      navigate("/");
    }
  }, [navigate]);
  
  const [aulas, setAulas] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [nombreAula, setNombreAula] = useState("");
  const [edificio, setEdificio] = useState("");
  const [idDispositivo, setIdDispositivo] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  const obtenerDispositivos = () => {
    fetch("https://servidor-class-access.vercel.app/api/dispositivos")
      .then(res => res.json())
      .then(data => {
        const activos = data.filter(d => d.estatus_dis === 1);
        setDispositivos(activos);
      });
  };

  const obtenerAulas = () => {
    fetch("https://servidor-class-access.vercel.app/api/aulas")
      .then(res => res.json())
      .then(data => setAulas(data));
  };

  useEffect(() => {
    obtenerDispositivos();
    obtenerAulas();
  }, []);

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

  const guardarAula = (e) => {
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
      ? `https://servidor-class-access.vercel.app/api/aulas/${editandoId}`
      : "https://servidor-class-access.vercel.app/api/aulas";

    const metodo = editandoId ? "PUT" : "POST";

    fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          limpiarFormulario();
          obtenerAulas();
          setPaginaActual(1); // Volver a página 1
        } else {
          alert("Error al guardar aula");
        }
      });
  };

  const editarAula = (aula) => {
    setNombreAula(aula.nombre_aula);
    setEdificio(aula.edificio);
    setIdDispositivo(aula.id_dispositivo || "");
    setEditandoId(aula.id_aula);
  };

  // Calcular índices para la paginación
  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const aulasActuales = aulas.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(aulas.length / registrosPorPagina);

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
                className="btn-cancelar"
                onClick={limpiarFormulario}
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

        <div className="table-responsive" style={{ overflow: 'visible' }}>
          {aulas.length > 0 ? (
            <>
              <table className="aulas-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>ID</th>
                    <th style={{ width: '25%' }}>Nombre</th>
                    <th style={{ width: '25%' }}>Edificio</th>
                    <th style={{ width: '25%' }}>Dispositivo</th>
                    <th style={{ width: '15%' }}>Acciones</th>
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
              <p>No hay aulas registradas</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Aulas;