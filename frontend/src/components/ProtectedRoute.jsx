/**
 * ProtectedRoute — Guarda de ruta autenticada.
 *
 * Si el usuario NO está autenticado, muestra una pantalla de error
 * directamente (sin redirigir). Si está cargando, muestra un spinner.
 * Si está autenticado, renderiza los hijos normalmente.
 */
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import styles from "./ProtectedRoute.module.css"

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    const navigate = useNavigate()

    // Mientras se verifica la sesión
    if (loading) {
        return (
            <div className={styles.center}>
                <div className={styles.spinner} />
                <p className={styles.loadingText}>Verificando sesión...</p>
            </div>
        )
    }

    // No autenticado — mostrar pantalla de error directamente
    if (!user) {
        return (
            <div className={styles.center}>
                <div className={styles.errorCard}>
                    <div className={styles.errorIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h2 className={styles.errorTitle}>Acceso no autorizado</h2>
                    <p className={styles.errorDesc}>
                        Debes iniciar sesión para acceder a esta sección del sistema.
                    </p>
                    <button
                        className={styles.loginBtn}
                        onClick={() => navigate("/")}
                    >
                        Ir al inicio de sesión
                    </button>
                </div>
            </div>
        )
    }

    // Autenticado — renderizar la página solicitada
    return children
}
