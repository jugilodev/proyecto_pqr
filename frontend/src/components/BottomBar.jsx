/**
 * BottomBar — Barra de navegación inferior visible en todas las páginas.
 *
 * Muestra opciones de navegación para todos los usuarios.
 * La opción "Crear usuario" solo aparece si rol === "admin".
 *
 * Props:
 *   - user          : objeto del usuario autenticado { nombre, rol }
 *   - onCreateUser  : función que abre el modal de crear usuario (solo admin)
 *   - onCreatePQR   : función que abre el drawer de nueva PQR
 */
import { useNavigate, useLocation } from "react-router-dom"
import styles from "./BottomBar.module.css"

export default function BottomBar({ user, onCreateUser, onCreatePQR }) {
    const navigate  = useNavigate()
    const location  = useLocation()

    // Determina si una ruta está activa para resaltarla
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/")

    return (
        <nav className={styles.bar}>

            {/* Opción: Dashboard / PQRs */}
            <button
                className={`${styles.item} ${isActive("/dashboard") ? styles.active : ""}`}
                onClick={() => navigate("/dashboard")}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                <span>PQRs</span>
            </button>

            {/* Opción: Nueva PQR — disponible para todos los usuarios */}
            <button
                className={styles.item}
                onClick={onCreatePQR}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <span>Nueva PQR</span>
            </button>

            {/* Opción: Crear usuario — solo para admin */}
            {user?.rol === "admin" && (
                <button
                    className={styles.item}
                    onClick={onCreateUser}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <line x1="19" y1="8" x2="19" y2="14"/>
                        <line x1="16" y1="11" x2="22" y2="11"/>
                    </svg>
                    <span>Crear usuario</span>
                </button>
            )}

            {/* Info del usuario */}
            <div className={styles.userItem}>
                <div className={styles.avatar}>
                    {user?.nombre?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className={styles.userText}>
                    <span className={styles.userName}>{user?.nombre}</span>
                    <span className={styles.userRole}>{user?.rol}</span>
                </div>
            </div>
        </nav>
    )
}
