/**
 * AuthContext — Contexto global de autenticación.
 *
 * Hace una sola petición a /api/auth/me al cargar la app.
 * Todos los componentes hijos pueden acceder al usuario actual
 * usando el hook `useAuth()`.
 */
import { createContext, useContext, useEffect, useState } from "react"
import api from "../api/axios"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)    // objeto usuario o null si no está logueado
    const [loading, setLoading] = useState(true)    // true mientras se verifica la sesión

    useEffect(() => {
        // Verificar sesión activa al montar la app
        api.get("/api/auth/me")
            .then(res => setUser(res.data))
            .catch(() => setUser(null))             // 401 u otro error → no autenticado
            .finally(() => setLoading(false))
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

/** Hook para acceder al contexto de auth desde cualquier componente */
export const useAuth = () => useContext(AuthContext)
