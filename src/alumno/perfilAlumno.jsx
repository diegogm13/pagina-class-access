import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/perfilAlumno.css";
import MenuAlumno from "./menuAlumno";

// 🍪 Utilidad para obtener cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }
  return null;
};

const PerfilAlumno = () => {
  const [usuario, setUsuario] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 🍪 Obtener datos del usuario desde la cookie
    const userDataCookie = getCookie("userData");

    if (userDataCookie) {
      try {
        const usuarioCookie = JSON.parse(userDataCookie);
        fetchAlumnoData(usuarioCookie.id_usu);
      } catch (error) {
        console.error("Error al parsear userData:", error);
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchAlumnoData = async (id) => {
    try {
      // 🍪 CRÍTICO: Agregar credentials: 'include' para enviar cookies
      const response = await fetch(`/api/students/${id}`, {
        method: 'GET',
        credentials: 'include', // 🍪 Enviar cookies con la petición
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData.message);
        
        if (response.status === 401) {
          // Token inválido o expirado, redirigir al login
          navigate("/");
          return;
        }
        
        throw new Error(errorData.message || 'Error al obtener datos');
      }

      const data = await response.json();
      
      // Verificar estructura de la respuesta
      const alumnoData = data.data || data;
      
      setUsuario(alumnoData);
      setFormData({
        nombre_usu: alumnoData.nombre_usu,
        ap_usu: alumnoData.ap_usu,
        am_usu: alumnoData.am_usu,
        correo_usu: alumnoData.correo_usu,
        matricula: alumnoData.matricula,
        cod_rfid: alumnoData.cod_rfid || "",
        grupo: alumnoData.grupo || ""
      });
    } catch (error) {
      console.error("Error al obtener datos del alumno:", error);
      setMessage("Error al cargar los datos del perfil");
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
      // 🍪 CRÍTICO: Agregar credentials: 'include'
      const response = await fetch(`/api/students/${usuario.id_usu}`, {
        method: "PUT",
        credentials: 'include', // 🍪 Enviar cookies con la petición
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 401) {
          setMessage("Sesión expirada. Por favor, inicia sesión nuevamente.");
          setTimeout(() => navigate("/"), 2000);
          return;
        }
        
        setMessage(errorData.message || "Error al actualizar el perfil");
        return;
      }

      const data = await response.json();

      if (data.success) {
        setMessage("Perfil actualizado correctamente");
        fetchAlumnoData(usuario.id_usu); // Refrescar datos
        setEditMode(false);
      } else {
        setMessage(data.message || "Error al actualizar el perfil");
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
      <MenuAlumno />
      
      <main className="contenido-alumno">
        <h1 className="titulo-perfil">Perfil del Alumno</h1>
        
        {message && (
          <div className={`message ${message.includes("correctamente") ? "success" : "error"}`}>
            {message}
          </div>
        )}

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
                <span className="info-value">
                  {usuario.nombre_usu} {usuario.ap_usu} {usuario.am_usu}
                </span>
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
                  {usuario.cod_rfid || "No registrado"}
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
                  name="nombre_usu"
                  value={formData.nombre_usu}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Apellido Paterno:</label>
                <input
                  type="text"
                  name="ap_usu"
                  value={formData.ap_usu}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Apellido Materno:</label>
                <input
                  type="text"
                  name="am_usu"
                  value={formData.am_usu}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Correo Electrónico:</label>
                <input
                  type="email"
                  name="correo_usu"
                  value={formData.correo_usu}
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