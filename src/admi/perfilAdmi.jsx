import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/perfilAdmi.css";
import MenuAdmin from "./menuAdmi";

const PerfilAdmin = () => {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioGuardado) {
      setUsuario(usuarioGuardado);
    } else {
      window.location.href = "/";
    }
  }, []);

  if (!usuario) return <div className="loading">Cargando...</div>;

  return (
    <div className="dashboard-administrador">
      <MenuAdmin />
      <main className="contenido-administrador">
        <div className="perfil-header">
          <div className="perfil-title-section">
            <h1>Mi Perfil</h1>
            <p className="perfil-subtitle">Administra tu información personal</p>
          </div>
          {/* 🔥 Botón eliminado */}
        </div>
        
        <div className="perfil-container">
          <div className="perfil-info">
            <div className="info-card">
              <div className="info-icon">👤</div>
              <div className="info-content">
                <span className="info-label" style={{ color: '#0270ffff' }}>
                  Nombre completo
                </span>
                <span className="info-value" style={{ color: '#0a1a2f' }}>
                  {usuario.nombre_usu} {usuario.ap_usu} {usuario.am_usu}
                </span>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">📧</div>
              <div className="info-content">
                <span className="info-label" style={{ color: '#0270ffff' }}>Correo electrónico</span>
                <span className="info-value " style={{ color: '#0a1a2f' }}>{usuario.correo_usu}</span>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">🔑</div>
              <div className="info-content">
                <span className="info-label" style={{ color: '#0270ffff' }}>Rol</span>
                <span className="info-value" style={{ color: '#0a1a2f' }}>Administrador</span>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">📊</div>
              <div className="info-content">
                <span className="info-label" style={{ color: '#0270ffff' }}>Estatus</span>
                <span className="info-value">
                  {usuario.estatus_usu === 1 ? (
                    <span className="status-active">● Activo</span>
                  ) : (
                    <span className="status-inactive">● Inactivo</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PerfilAdmin;
