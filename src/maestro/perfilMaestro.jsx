import React, { useEffect, useState } from "react";
import "../styles/perfilMaestro.css";
import axios from "axios";
import MenuMaestro from "./menuMaestro";
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

const PerfilMaestro = () => {
  const navigate = useNavigate();
  const [maestro, setMaestro] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 🍪 Obtener datos del usuario desde la cookie
    const userDataCookie = getCookie("userData");

    if (!userDataCookie) {
      console.warn("No se encontró cookie de sesión");
      navigate("/"); // Redirige al login si no hay cookie
      return;
    }

    let usuario;
    try {
      usuario = JSON.parse(userDataCookie);
    } catch (error) {
      console.error("Error al parsear userData:", error);
      navigate("/"); // Redirige si la cookie está corrupta
      return;
    }

    const id_usu = usuario.id_usu;

    // Verificar que sea un profesor (priv_usu = 2)
    if (usuario.priv_usu !== 2) {
      console.warn("Usuario no es profesor");
      navigate("/"); // Redirige si no es profesor
      return;
    }

    // 📡 Obtener datos del maestro desde el backend
    axios
      .get(`/api/teachers/${id_usu}/profile`, {
        withCredentials: true, // 🔑 Importante: envía las cookies con la petición
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        console.log("Datos del profesor obtenidos:", res.data);
        
        // La respuesta viene en el formato { success: true, data: {...} }
        if (res.data.success && res.data.data) {
          setMaestro(res.data.data);
        } else {
          setMaestro(res.data);
        }
        
        setCargando(false);
        setError(null);
      })
      .catch((err) => {
        console.error("Error al obtener datos del profesor:", err);
        
        if (err.response) {
          // El servidor respondió con un código de error
          if (err.response.status === 403) {
            setError("No tienes permiso para ver este perfil");
          } else if (err.response.status === 404) {
            setError("Perfil de profesor no encontrado");
          } else if (err.response.status === 401) {
            // Sin autenticación, redirigir al login
            navigate("/");
            return;
          } else {
            setError("Error al cargar el perfil");
          }
        } else if (err.request) {
          // La petición se hizo pero no hubo respuesta
          setError("No se pudo conectar con el servidor");
        } else {
          setError("Error al procesar la solicitud");
        }
        
        setCargando(false);
      });
  }, [navigate]);

  return (
    <div className="dashboard-maestro">
      <MenuMaestro />
      <main className="contenido-maestro">
        <div className="perfil-header">
          <div className="perfil-title-section">
            <h1>Mi Perfil</h1>
            <p className="perfil-subtitle">Información de tu cuenta</p>
          </div>
        </div>
        
        {cargando ? (
          <div className="cargando-perfil">
            <div className="spinner-perfil"></div>
            <p>Cargando información...</p>
          </div>
        ) : error ? (
          <div className="error-perfil">
            <div className="error-icon">⚠️</div>
            <h3>Error al cargar el perfil</h3>
            <p>{error}</p>
            <button 
              className="btn-reintentar"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="perfil-container">
            <div className="perfil-info">
              <div className="info-card">
                <div className="info-icon">👤</div>
                <div className="info-content">
                  <span className="info-label" style={{ color: '#0270ffff' }}>Nombre completo</span>
                  <span className="info-value" style={{ color: '#0a1a2f' }}>
                    {maestro.nombre_usu} {maestro.ap_usu} {maestro.am_usu}
                  </span>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon">📧</div>
                <div className="info-content">
                  <span className="info-label" style={{ color: '#0270ffff' }}>Correo electrónico</span>
                  <span className="info-value" style={{ color: '#0a1a2f' }}>
                    {maestro.correo_usu || 'No disponible'}
                  </span>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon">🆔</div>
                <div className="info-content">
                  <span className="info-label" style={{ color: '#0270ffff' }}>No. Empleado</span>
                  <span className="info-value" style={{ color: '#0a1a2f' }}>
                    {maestro.no_empleado || 'No asignado'}
                  </span>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon">🏫</div>
                <div className="info-content">
                  <span className="info-label" style={{ color: '#0270ffff' }}>ID de Profesor</span>
                  <span className="info-value" style={{ color: '#0a1a2f' }}>
                    {maestro.id_prof || 'No disponible'}
                  </span>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon">📊</div>
                <div className="info-content">
                  <span className="info-label" style={{ color: '#0270ffff' }}>Estatus</span>
                  <span className="info-value">
                  {maestro.estatus_usu ? (
                    <span className="status-active">● Activo</span>
                  ) : (
                    <span className="status-inactive">● Inactivo</span>
                  )}
                 </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PerfilMaestro;