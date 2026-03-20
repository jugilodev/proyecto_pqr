/**
 * EditPQR — Página de gestión de una PQR individual.
 *
 * Permite a la asesora:
 *   1. Ver toda la información de la PQR
 *   2. Cambiar el estado de la PQR
 *   3. Agregar entradas a la bitácora (correos enviados, respuestas, llamadas, etc.)
 *   4. Ver el historial completo de gestión en forma de línea de tiempo
 *
 * Ruta: /pqr/:id
 */
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import BottomBar from "../components/BottomBar"
import CreatePQRModal from "../components/CreatePQRModal"
import styles from "./EditPQR.module.css"

/* ── Colores de estado (igual que en Dashboard) ── */
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
    return ESTADO_COLORS[(tipo_estado || "").toLowerCase()] || { bg: "#e0e7ff", color: "#3730a3" }
}

function formatFecha(fecha) {
    if (!fecha) return "—"
    return new Date(fecha).toLocaleDateString("es-CO", {
        day: "2-digit", month: "long", year: "numeric",
    })
}

function formatFechaHora(fecha) {
    if (!fecha) return "—"
    return new Date(fecha).toLocaleString("es-CO", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    })
}

export default function EditPQR() {
    const { id }    = useParams()
    const navigate  = useNavigate()
    const { user }  = useAuth()

    /* ── Estado: datos de la PQR ── */
    const [pqr, setPqr]         = useState(null)
    const [bitacora, setBitacora] = useState([])
    const [loading, setLoading]       = useState(true)
    const [error, setError]           = useState("")
    const [showCreatePQR, setShowCreatePQR] = useState(false)  // Drawer nueva PQR

    /* ── Catálogos para los selects ── */
    const [estados, setEstados]           = useState([])
    const [tiposEvento, setTiposEvento]   = useState([])

    /* ── Formulario: cambiar estado ── */
    const [nuevoEstado, setNuevoEstado]     = useState("")
    const [notaEstado, setNotaEstado]       = useState("")
    const [loadingEstado, setLoadingEstado] = useState(false)
    const [msgEstado, setMsgEstado]         = useState(null)  // { type: "ok"|"error", text }

    /* ── Formulario: agregar bitácora ── */
    const [tipoEventoBit, setTipoEventoBit]   = useState("")
    const [descripcionBit, setDescripcionBit] = useState("")
    const [archivosBit, setArchivosBit]       = useState([])
    const [loadingBit, setLoadingBit]         = useState(false)
    const [msgBit, setMsgBit]                 = useState(null)

    /* ── Carga inicial ── */
    useEffect(() => {
        const fetchTodo = async () => {
            try {
                const [resPqr, resEstados, resTipos] = await Promise.all([
                    api.get(`/api/pqr/${id}`),
                    api.get("/api/catalogos/estados"),
                    api.get("/api/catalogos/tipo_evento"),
                ])
                setPqr({ ...resPqr.data, archivos: resPqr.data.archivos || [] })
                setBitacora(resPqr.data.bitacora || [])
                setEstados(resEstados.data)
                setTiposEvento(resTipos.data)
                setNuevoEstado(resPqr.data.id_estado?.toString() || "")
            } catch {
                setError("No se pudo cargar la PQR. Verifique su sesión.")
            } finally {
                setLoading(false)
            }
        }
        fetchTodo()
    }, [id])

    /* ── Logout ── */
    const handleLogout = async () => {
        try { await api.get("/logout") } finally { navigate("/") }
    }

    /* ── Cambiar estado ── */
    const handleCambiarEstado = async (e) => {
        e.preventDefault()
        if (!nuevoEstado) {
            setMsgEstado({ type: "error", text: "Selecciona el nuevo estado." })
            return
        }
        setLoadingEstado(true)
        setMsgEstado(null)
        try {
            await api.patch(`/api/pqr/${id}/estado`, {
                id_estado: parseInt(nuevoEstado),
                descripcion: notaEstado || undefined,
            })
            // Recargar la PQR con el estado actualizado
            const res = await api.get(`/api/pqr/${id}`)
            setPqr({ ...res.data, archivos: res.data.archivos || [] })
            setBitacora(res.data.bitacora || [])
            setNotaEstado("")
            setMsgEstado({ type: "ok", text: "Estado actualizado correctamente." })
        } catch (err) {
            setMsgEstado({ type: "error", text: err.response?.data?.message || "Error al actualizar estado." })
        } finally {
            setLoadingEstado(false)
        }
    }

    /* ── Agregar entrada a bitácora ── */
    const handleAgregarBitacora = async (e) => {
        e.preventDefault()
        if (!tipoEventoBit || !descripcionBit.trim()) {
            setMsgBit({ type: "error", text: "Completa el tipo de gestión y la descripción." })
            return
        }
        setLoadingBit(true)
        setMsgBit(null)
        try {
            const formData = new FormData()
            formData.append("id_tipo_evento", parseInt(tipoEventoBit))
            formData.append("descripcion", descripcionBit)
            archivosBit.forEach(archivo => formData.append("archivos", archivo))

            await api.post(`/api/pqr/${id}/bitacora`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            // Recargar bitácora
            const res = await api.get(`/api/pqr/${id}`)
            setBitacora(res.data.bitacora || [])
            setTipoEventoBit("")
            setDescripcionBit("")
            setArchivosBit([])
            setMsgBit({ type: "ok", text: "Entrada agregada a la bitácora." })
        } catch (err) {
            setMsgBit({ type: "error", text: err.response?.data?.message || "Error al agregar la entrada." })
        } finally {
            setLoadingBit(false)
        }
    }

    const handleQuitarArchivo = (index) => {
        setArchivosBit(prev => prev.filter((_, i) => i !== index))
    }

    /* ── Render de carga / error ── */
    if (loading) {
        return (
            <div className={styles.layout}>
                <Navbar user={user} onLogout={handleLogout} />
                <div className={styles.stateBox}>
                    <div className={styles.spinner} />
                    <p>Cargando PQR...</p>
                </div>
            </div>
        )
    }

    if (error || !pqr) {
        return (
            <div className={styles.layout}>
                <Navbar user={user} onLogout={handleLogout} />
                <div className={styles.errorBox}>{error || "PQR no encontrada"}</div>
            </div>
        )
    }

    const st = estadoStyle(pqr.tipo_estado)

    return (
        <div className={styles.layout}>
            <Navbar
                user={user}
                onLogout={handleLogout}
                actions={
                    <button className={styles.backBtn} onClick={() => navigate("/dashboard")}>
                        ← Volver al listado
                    </button>
                }
            />

            <main className={styles.main}>

                {/* ── Encabezado de la PQR ── */}
                <div className={styles.pqrHeader}>
                    <div className={styles.pqrHeaderLeft}>
                        <div className={styles.radicadoLabel}>Radicado</div>
                        <div className={styles.radicado}>{pqr.radicado}</div>
                        <span
                            className={styles.estadoBadge}
                            style={{ background: st.bg, color: st.color }}
                        >
                            {pqr.tipo_estado}
                        </span>
                    </div>
                    <div className={styles.pqrMeta}>
                        <span>{pqr.tipo_peticion}</span>
                        <span>·</span>
                        <span>{pqr.tipo_canal}</span>
                        <span>·</span>
                        <span>Reporte: {formatFecha(pqr.fecha_reporte)}</span>
                    </div>
                </div>

                <div className={styles.grid}>

                    {/* ── Columna izquierda: info + formularios ── */}
                    <div className={styles.colLeft}>

                        {/* Datos del cliente */}
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>Datos del cliente</h2>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Nombre</span>
                                    <span className={styles.infoValue}>{pqr.cliente_nombre} {pqr.apellido}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Cédula</span>
                                    <span className={styles.infoValue}>{pqr.cedula}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Celular</span>
                                    <span className={styles.infoValue}>{pqr.celular}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Correo</span>
                                    <span className={styles.infoValue}>{pqr.cliente_correo}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Dirección</span>
                                    <span className={styles.infoValue}>{pqr.direccion}</span>
                                </div>
                                {pqr.municipio && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Municipio</span>
                                        <span className={styles.infoValue}>{pqr.municipio}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Datos del vendedor (solo si existen) */}
                        {(pqr.vendedor_nombre || pqr.vendedor_cedula || pqr.vendedor_celular) && (
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>Datos del vendedor</h2>
                                <div className={styles.infoGrid}>
                                    {pqr.vendedor_nombre  && (
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Nombre</span>
                                            <span className={styles.infoValue}>{pqr.vendedor_nombre}</span>
                                        </div>
                                    )}
                                    {pqr.vendedor_cedula  && (
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Identificación</span>
                                            <span className={styles.infoValue}>{pqr.vendedor_cedula}</span>
                                        </div>
                                    )}
                                    {pqr.vendedor_celular && (
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Celular</span>
                                            <span className={styles.infoValue}>{pqr.vendedor_celular}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Descripción original del caso */}
                        {pqr.descripcion && (
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>Descripción del caso</h2>
                                <div className={styles.descripcion}>{pqr.descripcion}</div>
                            </div>
                        )}

                        {/* Archivos adjuntos de la PQR */}
                        {pqr.archivos?.length > 0 && (
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>Documentos adjuntos</h2>
                                <div className={styles.adjuntos}>
                                    {pqr.archivos.map(a => (
                                        <a
                                            key={a.id}
                                            href={`http://localhost:3000${a.ruta_archivo}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={styles.adjuntoDoc}
                                        >
                                            {a.tipo_mime?.startsWith("image/") ? "🖼" : "📄"} {a.nombre_original}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Formulario: cambiar estado */}
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>Cambiar estado</h2>
                            <form onSubmit={handleCambiarEstado} className={styles.form}>
                                <div className={styles.formRow}>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Nuevo estado</label>
                                        <select
                                            className={styles.select}
                                            value={nuevoEstado}
                                            onChange={e => setNuevoEstado(e.target.value)}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {estados.map(e => (
                                                <option key={e.id_estado} value={e.id_estado}>
                                                    {e.tipo_estado}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Nota (opcional)</label>
                                    <textarea
                                        className={styles.textarea}
                                        rows={2}
                                        placeholder="Agrega una nota sobre el cambio de estado..."
                                        value={notaEstado}
                                        onChange={e => setNotaEstado(e.target.value)}
                                    />
                                </div>
                                {msgEstado && (
                                    <div className={msgEstado.type === "ok" ? styles.successMsg : styles.errorMsg}>
                                        {msgEstado.text}
                                    </div>
                                )}
                                <button type="submit" className={styles.submitBtn} disabled={loadingEstado}>
                                    {loadingEstado ? "Actualizando..." : "Actualizar estado"}
                                </button>
                            </form>
                        </div>

                        {/* Formulario: agregar entrada a bitácora */}
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>Agregar gestión a bitácora</h2>
                            <p className={styles.cardHint}>
                                Registra correos enviados, respuestas recibidas, llamadas, etc.
                                Pega el contenido exacto del correo en la descripción.
                            </p>
                            <form onSubmit={handleAgregarBitacora} className={styles.form}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Tipo de gestión</label>
                                    <select
                                        className={styles.select}
                                        value={tipoEventoBit}
                                        onChange={e => setTipoEventoBit(e.target.value)}
                                    >
                                        <option value="">Seleccionar tipo...</option>
                                        {tiposEvento.map(t => (
                                            <option key={t.id_tipo_evento} value={t.id_tipo_evento}>
                                                {t.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Descripción / Contenido</label>
                                    <textarea
                                        className={styles.textareaLarge}
                                        rows={8}
                                        placeholder={
                                            "Pega aquí el contenido del correo, la respuesta recibida,\n" +
                                            "el resumen de la llamada o cualquier gestión realizada..."
                                        }
                                        value={descripcionBit}
                                        onChange={e => setDescripcionBit(e.target.value)}
                                    />
                                </div>

                                {/* ── Adjuntar archivos ── */}
                                <div className={styles.field}>
                                    <label className={styles.label}>Adjuntar archivos (opcional)</label>
                                    <label className={styles.fileInputLabel}>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,.pdf,.doc,.docx"
                                            className={styles.fileInputHidden}
                                            onChange={e => setArchivosBit(prev => [...prev, ...Array.from(e.target.files)])}
                                        />
                                        Seleccionar archivos
                                    </label>
                                    <p className={styles.fileHint}>Imágenes, PDF o Word · Máx. 10 MB por archivo</p>
                                    {archivosBit.length > 0 && (
                                        <ul className={styles.fileList}>
                                            {archivosBit.map((f, i) => (
                                                <li key={i} className={styles.fileItem}>
                                                    <span className={styles.fileIcon}>{f.type.startsWith("image/") ? "🖼" : "📄"}</span>
                                                    <span className={styles.fileName}>{f.name}</span>
                                                    <button
                                                        type="button"
                                                        className={styles.fileRemove}
                                                        onClick={() => handleQuitarArchivo(i)}
                                                    >✕</button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {msgBit && (
                                    <div className={msgBit.type === "ok" ? styles.successMsg : styles.errorMsg}>
                                        {msgBit.text}
                                    </div>
                                )}
                                <button type="submit" className={styles.submitBtn} disabled={loadingBit}>
                                    {loadingBit ? "Guardando..." : "Guardar en bitácora"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ── Columna derecha: bitácora ── */}
                    <div className={styles.colRight}>
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>
                                Bitácora de gestión
                                <span className={styles.bitacoraCount}>{bitacora.length}</span>
                            </h2>

                            {bitacora.length === 0 ? (
                                <div className={styles.bitacoraEmpty}>
                                    Aún no hay entradas en la bitácora de esta PQR.
                                </div>
                            ) : (
                                <div className={styles.timeline}>
                                    {bitacora.map((entrada, idx) => (
                                        <div key={entrada.id_bitacora} className={styles.timelineItem}>

                                            {/* Línea vertical de la timeline */}
                                            <div className={styles.timelineDot} />
                                            {idx < bitacora.length - 1 && <div className={styles.timelineLine} />}

                                            {/* Contenido de la entrada */}
                                            <div className={styles.timelineContent}>
                                                <div className={styles.timelineHeader}>
                                                    <span className={styles.timelineEvento}>
                                                        {entrada.tipo_evento}
                                                    </span>
                                                    <span className={styles.timelineFecha}>
                                                        {formatFechaHora(entrada.created_at)}
                                                    </span>
                                                </div>

                                                {/* Si hubo cambio de estado, mostrarlo */}
                                                {entrada.estado_anterior && entrada.estado_nuevo && (
                                                    <div className={styles.timelineEstados}>
                                                        <span className={styles.estadoAnterior}>
                                                            {entrada.estado_anterior}
                                                        </span>
                                                        <span className={styles.estadoArrow}>→</span>
                                                        <span className={styles.estadoNuevo}>
                                                            {entrada.estado_nuevo}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Descripción completa (correo, nota, etc.) */}
                                                <div className={styles.timelineDesc}>
                                                    {entrada.descripcion}
                                                </div>

                                                {/* Archivos adjuntos */}
                                                {entrada.archivos?.length > 0 && (
                                                    <div className={styles.adjuntos}>
                                                        {entrada.archivos.map(a => (
                                                            <a
                                                                key={a.id}
                                                                href={`http://localhost:3000${a.ruta_archivo}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className={styles.adjuntoDoc}
                                                            >
                                                                {a.tipo_mime?.startsWith("image/") ? "🖼" : "📄"} {a.nombre_original}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Quién registró la gestión */}
                                                <div className={styles.timelineAutor}>
                                                    {entrada.usuario_nombre}
                                                    <span className={styles.timelineRol}>
                                                        · {entrada.usuario_rol} · {entrada.usuario_area}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Drawer nueva PQR ── */}
            {showCreatePQR && (
                <CreatePQRModal onClose={() => setShowCreatePQR(false)} />
            )}

            {/* ── Barra inferior de navegación ── */}
            <BottomBar
                user={user}
                onCreatePQR={() => setShowCreatePQR(true)}
            />
        </div>
    )
}
