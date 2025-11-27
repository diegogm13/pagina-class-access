import React, { useEffect, useState } from "react";
import "../styles/perfilMaestro.css";
import axios from "axios";
import MenuMaestro from "./menuMaestro";
import { useNavigate } from "react-router-dom";

const PerfilMaestro = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (!usuario) {
      navigate("/");
    }
  }, [navigate]);

  const [maestro, setMaestro] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const id_usu = localStorage.getItem("id_usu");
    if (!id_usu) return;

    axios.get(`https://servidor-class-access.vercel.app/api/perfilprof/${id_usu}`)
      .then((res) => {
        setMaestro(res.data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al obtener datos del profesor:", err);
        setCargando(false);
      });
  }, []);

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
                  <span className="info-value" style={{ color: '#0a1a2f' }}>{maestro.correo_usu}</span>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon">🆔</div>
                <div className="info-content">
                  <span className="info-label" style={{ color: '#0270ffff' }}>No. Empleado</span>
                  <span className="info-value" style={{ color: '#0a1a2f' }}>{maestro.no_empleado}</span>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon">📊</div>
                <div className="info-content">
                  <span className="info-label" style={{ color: '#0270ffff' }}>Estatus</span>
                  <span className="info-value">
                    {maestro.estatus_usu === 1 ? (
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