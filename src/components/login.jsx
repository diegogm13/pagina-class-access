import React, { useState } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.258 0 2.449.197 3.551.52M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.9 8.28l-3.376 3.376M19.5 6.5l-6.075 6.075M4.5 17.5l6.075-6.075" />
    </svg>
);

// 🍪 Utilidad para obtener una cookie por su nombre
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return decodeURIComponent(parts.pop().split(';').shift());
    }
    return null;
};

const Login = () => {
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [mostrarContrasena, setMostrarContrasena] = useState(false);

    const navigate = useNavigate();
    const irRegistro = () => navigate("/RegistroAlumno");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!correo.trim() || !contrasena.trim()) {
            setMensaje("Por favor completa todos los campos");
            return;
        }

        try {
            const response = await fetch("https://classaccess-backend.vercel.app/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include', // 🍪 IMPORTANTE: Incluir cookies en cada request
                body: JSON.stringify({ correo, password: contrasena }),
            });

            if (!response.ok) {
                if (response.status >= 500) {
                    setMensaje("Error del servidor o base de datos no disponible");
                    return;
                }
            }

            const data = await response.json();

            if (!response.ok) {
                setMensaje(data.message || "Credenciales incorrectas");
                return;
            }

            setMensaje("Login exitoso");

            // 🍪 Esperar un momento para que las cookies se establezcan
            await new Promise(resolve => setTimeout(resolve, 100));

            // Leer userData de la cookie
            const userDataCookie = getCookie("userData");
            
            console.log("Todas las cookies:", document.cookie);
            console.log("userData cookie:", userDataCookie);

            // Si no hay cookie, usar los datos de la respuesta del servidor
            let userData;
            if (userDataCookie) {
                userData = JSON.parse(userDataCookie);
            } else if (data.data && data.data.user) {
                // Fallback: usar datos de la respuesta
                console.warn("Cookie no encontrada, usando respuesta del servidor");
                userData = data.data.user;
            } else {
                setMensaje("Error al obtener datos de usuario");
                return;
            }

            const tipoUsuario = userData.priv_usu;

            // 🎯 Redirigir según el tipo de usuario
            switch (tipoUsuario) {
                case 1: navigate("/alumno"); break;
                case 2: navigate("/maestro"); break;
                case 3: navigate("/admi"); break;
                default: setMensaje("Tipo de usuario desconocido");
            }

        } catch (error) {
            console.error("Error:", error);
            setMensaje("No se pudo conectar al servidor. Verifica tu conexión o la base de datos.");
        }
    };

    const getMensajeClass = () => {
        if (!mensaje) return "";
        return mensaje.includes("exitoso") ? "success" : "error";
    };

    return (
        <div className="login-page">
            <div className="left-panel">
                <img src="/logo.png" alt="Logo" className="logo-image" />
            </div>
            <div className="right-panel">
                <div className="form-container">
                    <h2>Inicio de Sesión</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="correo">Correo Electrónico</label>
                            <input
                                id="correo"
                                type="email"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contrasena">Contraseña</label>
                            <div className="password-container">
                                <input
                                    id="contrasena"
                                    type={mostrarContrasena ? "text" : "password"}
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    maxLength={20}
                                    required
                                />
                                <span
                                    className="toggle-password-icon"
                                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                                >
                                    {mostrarContrasena ? <EyeOffIcon /> : <EyeIcon />}
                                </span>
                            </div>
                        </div>

                        <button type="submit" className="login-button">Iniciar Sesión</button>
                        <button type="button" onClick={irRegistro} className="boton-registro">Registro</button>
                    </form>

                    {mensaje && <p className={`mensaje ${getMensajeClass()}`}>{mensaje}</p>}
                </div>
            </div>
        </div>
    );
};

export default Login;