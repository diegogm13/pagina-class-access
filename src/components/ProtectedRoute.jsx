import React from 'react';
import { Navigate } from 'react-router-dom';

// 🍪 Utilidad para obtener cookies
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return decodeURIComponent(parts.pop().split(';').shift());
    }
    return null;
};

// 🔒 Hook personalizado para autenticación
export const useAuth = () => {
    const getUserData = () => {
        const cookie = getCookie("userData");
        return cookie ? JSON.parse(cookie) : null;
    };

    const isAuthenticated = () => {
        const userData = getUserData();
        return !!userData; // ✅ autentica si existe la cookie userData
    };

    const getPrivilegio = () => {
        const userData = getUserData();
        return userData ? userData.priv_usu : null;
    };

    return { 
        getUserData, 
        isAuthenticated, 
        getPrivilegio 
    };
};

// 🛡️ Componente ProtectedRoute
const ProtectedRoute = ({ children, requiredPriv = null }) => {
    const { isAuthenticated, getPrivilegio } = useAuth();

    // Verificar si está autenticado
    if (!isAuthenticated()) {
        console.log("❌ No autenticado, redirigiendo a login");
        return <Navigate to="/" replace />;
    }

    // Verificar privilegio si es requerido
    if (requiredPriv !== null) {
        const userPriv = getPrivilegio();
        if (userPriv !== requiredPriv) {
            console.log(`❌ Privilegio incorrecto: tiene ${userPriv}, necesita ${requiredPriv}`);
            // Redirigir según el privilegio del usuario
            switch (userPriv) {
                case 1: return <Navigate to="/alumno" replace />;
                case 2: return <Navigate to="/maestro" replace />;
                case 3: return <Navigate to="/admi" replace />;
                default: return <Navigate to="/" replace />;
            }
        }
    }

    console.log("✅ Autenticado correctamente");
    return children;
};

export default ProtectedRoute;
