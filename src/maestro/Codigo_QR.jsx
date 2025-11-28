import React, { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import "../styles/maestro.css";
import "../styles/codigoQR.css";
import MenuMaestro from "./menuMaestro";

// 🍪 Utilidad para obtener cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(";").shift());
  }
  return null;
};

const Codigo_QR = () => {
  const [profesor, setProfesor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userDataCookie = getCookie("userData");

    if (!userDataCookie) {
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

    setCargando(true);
    axios
      .get(`http://localhost:3001/api/teachers/${id_usu}`, { withCredentials: true })
      .then((res) => {
        if (res.data && res.data.success && res.data.data) {
          setProfesor(res.data.data); // ✅ usamos data
        } else {
          console.warn("Profesor no encontrado");
          setProfesor(null);
        }
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al obtener profesor:", err);
        setProfesor(null);
        setCargando(false);
      });
  }, [navigate]);

  return (
    <div className="dashboard-maestro">
      <MenuMaestro />
      <main className="contenido-maestro">
        {cargando ? (
          <div className="cargando-qr">
            <p>Cargando código QR...</p>
          </div>
        ) : profesor ? (
          <div className="contenedor-qr">
            <h1 className="titulo-qr">Código QR de Identificación</h1>
            <div className="tarjeta-qr">
              <h2 className="nombre-profesor">
                {profesor.nombre_usu} {profesor.ap_usu} {profesor.am_usu}
              </h2>
              <p className="numero-empleado">No. Empleado: {profesor.no_empleado}</p>
              <div className="codigo-qr-container">
                <QRCodeSVG
                  value={String(profesor.no_empleado)} // o JSON.stringify({...}) si quieres más datos
                  size={256}
                  className="codigo-qr"
                  includeMargin={true}
                />
              </div>
              <p className="instrucciones">
                Acerque su código al lector para registrar su entrada
              </p>
            </div>
          </div>
        ) : (
          <div className="error-qr">
            <p>Profesor no encontrado. Verifica tu información o contacta al administrador.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Codigo_QR;
