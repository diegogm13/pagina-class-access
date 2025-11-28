import React, { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import "../styles/alumno.css";
import "../styles/codigoAlumno.css";
import MenuAlumno from "./menuAlumno";

// 🍪 Obtener cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return null;
};

const Codigo = () => {
  const [alumno, setAlumno] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userDataCookie = getCookie("userData");
    if (!userDataCookie) {
      setError("No se encontró sesión de usuario");
      setIsLoading(false);
      return navigate("/");
    }

    let usuario;
    try {
      usuario = JSON.parse(userDataCookie);
    } catch (err) {
      console.error("Error al parsear userData:", err);
      setError("Error en la sesión del usuario");
      setIsLoading(false);
      return navigate("/");
    }

    const fetchAlumno = async () => {
      try {
        const response = await axios.get(`https://classaccess-backend.vercel.app/api/students/${usuario.id_usu}`, {
          withCredentials: true, // 🍪 enviar cookies
        });

        if (!response.data.success) {
          setError(response.data.message || "Alumno no encontrado");
        } else {
          setAlumno(response.data.data); // 🍪 la info está en data
        }
      } catch (err) {
        console.error("Error al obtener alumno:", err);
        setError("Error al cargar los datos del alumno");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlumno();
  }, [navigate]);

  if (isLoading) return (
    <div className="alumno-container">
      <MenuAlumno />
      <div className="contenido-alumno"><p>Cargando información del alumno...</p></div>
    </div>
  );

  if (error) return (
    <div className="alumno-container">
      <MenuAlumno />
      <div className="contenido-alumno"><p>{error}</p></div>
    </div>
  );

  // Usar id_usu como QR mientras matricula/cod_rfid sea null
  const qrValue = alumno.matricula || alumno.cod_rfid || alumno.id_usu;

  return (
    <div className="alumno-container">
      <MenuAlumno />
      <main className="contenido-alumno">
        <h1 className="titulo-qr">Código QR de Identificación</h1>
        <div className="contenedor-qr">
          <div className="tarjeta-qr">
            <h2 className="nombre-alumno">
              {alumno.nombre_usu} {alumno.ap_usu}
            </h2>
            <p className="matricula">{alumno.matricula || "Sin matrícula registrada"}</p>
            <div className="codigo-qr-container">
              <QRCodeSVG
                value={String(qrValue)}
                size={256}
                className="codigo-qr"
                includeMargin={true}
                level="H"
              />
            </div>
            <p className="instrucciones">
              Muestra este código QR para registrar tu asistencia
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Codigo;
