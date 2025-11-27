import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/perfilAlumno.css";
import MenuAlumno from "./menuAlumno";

const PerfilAlumno = () => {
  const [usuario, setUsuario] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioGuardado) {
      fetchAlumnoData(usuarioGuardado.id_usu);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchAlumnoData = async (id) => {
    try {
      const response = await fetch(`https://servidor-class-access.vercel.app/alumno/${id}`);
      const data = await response.json();
      setUsuario(data);
      setFormData({
        nombre: data.nombre_usu,
        ap: data.ap_usu,
        am: data.am_usu,
        correo: data.correo_usu,
        matricula: data.matricula,
        cod_rfid: data.cod_rfid || "",
        grupo: data.grupo || ""
      });
    } catch (error) {
      console.error("Error al obtener datos del alumno:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`https://servidor-class-access.vercel.app/alumno/${usuario.id_usu}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Perfil actualizado correctamente");
        fetchAlumnoData(usuario.id_usu); // Refrescar datos
        setEditMode(false);
      } else {
        setMessage("Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      setMessage("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) return <div className="cargando">Cargando...</div>;

  return (
    <div className="alumno-container">
      {/* Sidebar */}
      <MenuAlumno />
      
      <main className="contenido-alumno">
        <h1 className="titulo-perfil">Perfil del Alumno</h1>
        
        {message && <div className={`message ${message.includes("correctamente") ? "success" : "error"}`}>{message}</div>}

        {!editMode ? (
          <div className="card-perfil">
            <div className="perfil-header">
              <h2>Información Personal</h2>
              <button 
                className="btn-editar"
                onClick={() => setEditMode(true)}
              >
                Editar Perfil
              </button>
            </div>
            
            <div className="perfil-info">
              <div className="info-item">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{usuario.nombre_usu} {usuario.ap_usu} {usuario.am_usu}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Correo:</span>
                <span className="info-value">{usuario.correo_usu}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Rol:</span>
                <span className="info-value">Alumno</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Matrícula:</span>
                <span className="info-value">{usuario.matricula}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Grupo:</span>
                <span className="info-value">{usuario.grupo || "No asignado"}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Código RFID:</span>
                <span className="info-value">
                  {usuario.cod_rfid ? usuario.cod_rfid : "No registrado"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-perfil">
            <div className="perfil-header">
              <h2>Editar Perfil</h2>
              <button 
                className="btn-cancelar"
                onClick={() => setEditMode(false)}
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-editar">
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Apellido Paterno:</label>
                <input
                  type="text"
                  name="ap"
                  value={formData.ap}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Apellido Materno:</label>
                <input
                  type="text"
                  name="am"
                  value={formData.am}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Correo Electrónico:</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Matrícula:</label>
                <input
                  type="text"
                  name="matricula"
                  value={formData.matricula}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Grupo:</label>
                <input
                  type="text"
                  name="grupo"
                  value={formData.grupo}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Código RFID:</label>
                <input
                  type="text"
                  name="cod_rfid"
                  value={formData.cod_rfid}
                  onChange={handleInputChange}
                  placeholder="Escanea tu tarjeta RFID"
                />
              </div>

              <button 
                type="submit" 
                className="btn-guardar"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default PerfilAlumno;