/**
 * PQRDetailModal — Ventana emergente con el detalle de una PQR.
 *
 * Se abre al hacer clic en el número de radicado desde el Dashboard.
 * Muestra toda la información de la PQR incluyendo la descripción del caso.
 *
 * Props:
 *   - pqr: objeto con los datos de la PQR (vienen del listado, no hace petición extra)
 *   - onClose: función para cerrar el modal
 */
import styles from "./PQRDetailModal.module.css"

const ESTADO_COLORS = {
    "abierto":     { bg: "#dbeafe", color: "#1d4ed8" },
    "en gestión":  { bg: "#fef9c3", color: "#a16207" },
    "en gestion":  { bg: "#fef9c3", color: "#a16207" },
    "pendiente":   { bg: "#ffedd5", color: "#c2410c" },
    "resuelto":    { bg: "#dcfce7", color: "#15803d" },
    "cerrado":     { bg: "#f3f4f6", color: "#374151" },
    "vencido":     { bg: "#fee2e2", color: "#b91c1c" },
}

function estadoStyle(tipo_estado) {
    const key = (tipo_estado || "").toLowerCase()
    return ESTADO_COLORS[key] || { bg: "#e0e7ff", color: "#3730a3" }
}

function formatFecha(fecha) {
    if (!fecha) return "—"
    return new Date(fecha).toLocaleDateString("es-CO", {
        day: "2-digit", month: "long", year: "numeric"
    })
}

/** Fila de información dentro del modal */
function InfoRow({ label, value }) {
    if (!value) return null
    return (
        <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{label}</span>
            <span className={styles.infoValue}>{value}</span>
        </div>
    )
}

export default function PQRDetailModal({ pqr, onClose }) {
    if (!pqr) return null

    const st = estadoStyle(pqr.tipo_estado)

    // Cerrar al hacer clic en el overlay (fuera del modal)
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>

                {/* ── Encabezado ── */}
                <div className={styles.header}>
                    <div>
                        <div className={styles.radicado}>{pqr.radicado}</div>
                        <span
                            className={styles.estadoBadge}
                            style={{ background: st.bg, color: st.color }}
                        >
                            {pqr.tipo_estado}
                        </span>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                {/* ── Contenido ── */}
                <div className={styles.body}>

                    {/* Sección: Datos del caso */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Datos del caso</h3>
                        <InfoRow label="Tipo de petición"  value={pqr.tipo_peticion} />
                        <InfoRow label="Canal de ingreso"  value={pqr.tipo_canal} />
                        <InfoRow label="Fecha de reporte"  value={formatFecha(pqr.fecha_reporte)} />
                        <InfoRow label="Fecha del evento"  value={formatFecha(pqr.fecha_evento)} />
                    </div>

                    {/* Sección: Datos del cliente */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Datos del cliente</h3>
                        <InfoRow label="Nombre"    value={`${pqr.nombre} ${pqr.apellido}`} />
                        <InfoRow label="Cédula"    value={pqr.cedula} />
                        <InfoRow label="Celular"   value={pqr.celular} />
                        <InfoRow label="Correo"    value={pqr.correo} />
                        <InfoRow label="Dirección" value={pqr.direccion} />
                    </div>

                    {/* Sección: Datos del vendedor (solo si existen) */}
                    {(pqr.vendedor_nombre || pqr.vendedor_cedula || pqr.vendedor_celular) && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Datos del vendedor</h3>
                            <InfoRow label="Nombre"         value={pqr.vendedor_nombre} />
                            <InfoRow label="Identificación" value={pqr.vendedor_cedula} />
                            <InfoRow label="Celular"        value={pqr.vendedor_celular} />
                        </div>
                    )}

                    {/* Sección: Descripción del caso */}
                    {pqr.descripcion && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Descripción del caso</h3>
                            <div className={styles.descripcion}>{pqr.descripcion}</div>
                        </div>
                    )}
                </div>

                {/* ── Pie ── */}
                <div className={styles.footer}>
                    <span className={styles.footerNote}>ID: {pqr.id_pqr}</span>
                    <button className={styles.closeFooterBtn} onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}
