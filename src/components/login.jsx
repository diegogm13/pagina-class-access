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
            credentials: 'include',
            body: JSON.stringify({ correo, password: contrasena }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status >= 500) {
                setMensaje("Error del servidor o base de datos no disponible");
            } else {
                setMensaje(data.message || "Credenciales incorrectas");
            }
            return;
        }

        setMensaje("Login exitoso");

        // 🔍 DEBUG: Ver headers de respuesta
        console.log("=== RESPONSE HEADERS ===");
        for (let [key, value] of response.headers.entries()) {
            console.log(`${key}: ${value}`);
        }
        console.log("=== COOKIES ACTUALES ===");
        console.log(document.cookie);

        // 💾 GUARDAR EN LOCALSTORAGE como respaldo
        if (data.data?.user) {
            localStorage.setItem('userData', JSON.stringify(data.data.user));
        }
        if (data.data?.accessToken) {
            localStorage.setItem('accessToken', data.data.accessToken);
        }
        if (data.data?.refreshToken) {
            localStorage.setItem('refreshToken', data.data.refreshToken);
        }

        await new Promise(resolve => setTimeout(resolve, 200));

        let userData;
        const userDataCookie = getCookie("userData");
        
        if (userDataCookie) {
            console.log("✅ Usando cookie");
            userData = JSON.parse(userDataCookie);
        } else {
            console.log("⚠️ Cookie no disponible, usando localStorage");
            const stored = localStorage.getItem('userData');
            userData = stored ? JSON.parse(stored) : data.data?.user;
        }

        if (!userData) {
            setMensaje("Error al obtener datos de usuario");
            return;
        }

        const tipoUsuario = userData.priv_usu;

        switch (tipoUsuario) {
            case 1: navigate("/alumno"); break;
            case 2: navigate("/maestro"); break;
            case 3: navigate("/admi"); break;
            default: setMensaje("Tipo de usuario desconocido");
        }

    } catch (error) {
        console.error("Error:", error);
        setMensaje("No se pudo conectar al servidor.");
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