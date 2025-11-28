import React, { useEffect, useState } from "react";
import "../styles/administrador.css";
import { useNavigate } from "react-router-dom";
import MenuAdmin from "./menuAdmi";
import HeaderImage from "../uteq-administrador.jpeg";

const Admi = () => {
  const [nombre, setNombre] = useState("");
  const navigate = useNavigate();

  // ✅ Obtener datos del usuario desde el backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("https://classaccess-backend.vercel.app/api/auth/me", {
          credentials: "include" // 🍪 enviar cookies HttpOnly
        });

        if (!res.ok) {
          // No autenticado, redirigir al login
          navigate("/");
          return;
        }

        const data = await res.json();
        setNombre(data.user.nombre_usu);
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        navigate("/"); // Redirigir al login en caso de error
      }
    };

    fetchUserData();
  }, [navigate]);

  // Ir a la página de usuarios
  const irUsuarios = () => {
    navigate("/usuarios");
  };

  // ✅ Logout seguro
  const cerrarSesion = async () => {
    try {
      await fetch("https://classaccess-backend.vercel.app/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      navigate("/"); // Redirigir al login
    }
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
            <button onClick={irUsuarios} className="btn-ir-usuarios">Ir a Usuarios</button>
            <button onClick={cerrarSesion} className="btn-cerrar-sesion">Cerrar Sesión</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admi;
