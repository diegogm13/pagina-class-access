import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredPriv = null }) => {
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);
    const [userPriv, setUserPriv] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("https://classaccess-backend.vercel.app/api/auth/me", {
                    credentials: "include"
                });
                if (!res.ok) {
                    setIsAuth(false);
                } else {
                    const data = await res.json();
                    setIsAuth(true);
                    setUserPriv(data.user.priv_usu);
                }
            } catch (error) {
                console.error("Error al verificar autenticación:", error);
                setIsAuth(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <p>Cargando...</p>; // Opcional: spinner o loader
    }

    if (!isAuth) {
        console.log("❌ No autenticado, redirigiendo a login");
        return <Navigate to="/" replace />;
    }

    if (requiredPriv !== null && userPriv !== requiredPriv) {
        console.log(`❌ Privilegio incorrecto: tiene ${userPriv}, necesita ${requiredPriv}`);
        // Redirigir según privilegio del usuario
        switch (userPriv) {
            case 1: return <Navigate to="/alumno" replace />;
            case 2: return <Navigate to="/maestro" replace />;
            case 3: return <Navigate to="/admi" replace />;
            default: return <Navigate to="/" replace />;
        }
    }

    console.log("✅ Autenticado correctamente");
    return children;
};

export default ProtectedRoute;
