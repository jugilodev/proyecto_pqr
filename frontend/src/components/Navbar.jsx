/**
 * Navbar — Barra de navegación reutilizable.
 *
 * Props:
 *   - user: objeto del usuario autenticado { nombre, rol }
 *   - onLogout: función a llamar al hacer clic en "Cerrar sesión"
 *   - actions: (opcional) nodos React para botones adicionales en la derecha
 */
import styles from "./Navbar.module.css"

export default function Navbar({ user, onLogout, actions }) {
    return (
        <header className={styles.navbar}>
            {/* Logo y nombre del sistema */}
            <div className={styles.brand}>
                <div className={styles.logoBox}>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 10.9 12 11.5 12 13h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H9c0-1.66 1.34-3 3-3s3 1.34 3 3c0 .66-.27 1.26-.69 1.69z"/>
                    </svg>
                </div>
                <div>
                    <div className={styles.title}>SuSuerte</div>
                    <div className={styles.subtitle}>Sistema PQR</div>
                </div>
            </div>

            {/* Acciones y usuario */}
            <div className={styles.right}>
                {/* Slot para botones extra (ej: "Crear usuario") */}
                {actions && <div className={styles.actions}>{actions}</div>}

                {/* Info del usuario autenticado */}
                {user && (
                    <div className={styles.userInfo}>
                        <div className={styles.userName}>{user.nombre}</div>
                        <div className={styles.userRole}>{user.rol}</div>
                    </div>
                )}

                {/* Botón cerrar sesión */}
                <button className={styles.logoutBtn} onClick={onLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Cerrar sesión
                </button>
            </div>
        </header>
    )
}
