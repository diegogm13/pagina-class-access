import React, { useEffect, useState } from "react";
import "../styles/administrador.css";
import { useNavigate } from "react-router-dom";
import MenuAdmin from "./menuAdmi";
import HeaderImage from "../uteq-administrador.jpeg";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }
  return null;
};

const Admi = () => {
  const [nombre, setNombre] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 🔄 Intentar obtener datos: Cookie > localStorage
    let userData = null;
    
    const userDataCookie = getCookie("userData");
    if (userDataCookie) {
      try {
        userData = JSON.parse(userDataCookie);
        console.log("✅ Usando cookie en dashboard");
      } catch (error) {
        console.error("Error al parsear cookie:", error);
      }
    }

    // Si no hay cookie, intentar localStorage
    if (!userData) {
      const stored = localStorage.getItem('userData');
      if (stored) {
        try {
          userData = JSON.parse(stored);
          console.log("⚠️ Usando localStorage en dashboard");
        } catch (error) {
          console.error("Error al parsear localStorage:", error);
        }
      }
    }

    if (userData) {
      setNombre(userData.nombre_usu);
    } else {
      // Si no hay datos, redirigir al login
      console.log("❌ No hay datos de usuario, redirigiendo a login");
      navigate("/");
    }
  }, [navigate]);

  const cerrarSesion = async () => {
    try {
      // 🔥 Llamar al endpoint de logout del backend
      await fetch("https://classaccess-backend.vercel.app/api/auth/logout", {
        method: "POST",
        credentials: 'include'
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }

    // 🧹 Limpiar localStorage
    localStorage.removeItem('userData');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // 🧹 Limpiar cookies manualmente (por si acaso)
    document.cookie = "userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    navigate("/");
  };

  return (
    <div className="dashboard-administrador">
      <MenuAdmin />

      <main className="contenido-administrador">
        <div 
          className="header-banner"
          style={{ backgroundImage: `url(${HeaderImage})` }}
        >
          <div className="header-overlay">
            <h1>Bienvenido, {nombre}!</h1>
            <p className="subtitle">Selecciona una opción del menú para comenzar.</p>
          </div>
        </div>

        <div className="main-content">
          <div className="content-card">
            <h2>Panel de Administración</h2>
            <p>Gestiona usuarios, asistencias y toda la información del sistema.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admi;