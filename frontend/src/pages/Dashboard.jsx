/**
 * Dashboard — Página principal del sistema PQR.
 *
 * Muestra la tabla de PQRs con:
 *   - Filtros por columna (texto, select, rango de fechas)
 *   - Ordenamiento por fecha (asc/desc)
 *   - Modal de detalle al hacer clic en el radicado
 *   - Botón para editar cada PQR
 *   - Botón "Crear usuario" solo visible para administradores
 */
import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import BottomBar from "../components/BottomBar"
import PQRDetailModal from "../components/PQRDetailModal"
import CreateUserModal from "../components/CreateUserModal"
import CreatePQRModal from "../components/CreatePQRModal"
import styles from "./Dashboard.module.css"

/* ── Colores para los badges de estado ── */
const ESTADO_COLORS = {
    "abierto": { bg: "#dbeafe", color: "#1d4ed8" },
    "en gestión": { bg: "#fef9c3", color: "#a16207" },
    "en gestion": { bg: "#fef9c3", color: "#a16207" },
    "pendiente": { bg: "#fef3c7", color: "#92400e" },
    "en revisión": { bg: "#ffedd5", color: "#c2410c" },  // naranja
    "en revision": { bg: "#ffedd5", color: "#c2410c" },  // naranja
    "revision": { bg: "#ffedd5", color: "#c2410c" },  // naranja
    "revisión": { bg: "#ffedd5", color: "#c2410c" },  // naranja
    "análisis": { bg: "#dcfce7", color: "#15803d" },  // verde
    "analisis": { bg: "#dcfce7", color: "#15803d" },  // verde
    "resuelto": { bg: "#dcfce7", color: "#15803d" },
    "cerrado": { bg: "#fee2e2", color: "#b91c1c" },  // rojo
    "vencido": { bg: "#7f1d1d", color: "#fef2f2" },
}

function estadoStyle(tipo_estado) {
    return ESTADO_COLORS[(tipo_estado || "").toLowerCase()] || { bg: "#e0e7ff", color: "#3730a3" }
}

// Lógica de fechas, festivos colombianos y vencimiento → módulo separado
import { calcDiasRestantes, vencimientoStyle, formatFecha } from "../utils/fechas"

/** Convierte una fecha a string ISO yyyy-mm-dd para comparar en filtros */
function toISO(fecha) {
    if (!fecha) return ""
    return new Date(fecha).toISOString().split("T")[0]
}

/* ── Estado inicial de filtros ── */
const INIT_FILTERS = {
    radicado: "", estado: "", tipo: "", canal: "",
    cliente: "", cedula: "", celular: "",
    fecha_reporte_desde: "", fecha_reporte_hasta: "",
    fecha_evento_desde: "", fecha_evento_hasta: "",
}
const PAGE_SIZE = 10

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [pqrs, setPqrs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [filters, setFilters] = useState(INIT_FILTERS)
    const [currentPage, setCurrentPage] = useState(1)
    const [sort, setSort] = useState({ column: null, direction: "asc" })
    const [selectedPqr, setSelectedPqr] = useState(null)    // PQR en el modal de detalle
    const [showCreateUser, setShowCreateUser] = useState(false)   // Modal crear usuario
    const [showCreatePQR, setShowCreatePQR] = useState(false)   // Drawer nueva PQR
    const [openDateFilter, setOpenDateFilter] = useState(null)    // "fecha_reporte" | "fecha_evento" | null

    /* ── Carga de datos ── */
    useEffect(() => {
        api.get("/api/pqr")
            .then(res => setPqrs(res.data))
            .catch(() => setError("No se pudo cargar la información."))
            .finally(() => setLoading(false))
    }, [])

    /* ── Logout ── */
    const handleLogout = async () => {
        try { await api.get("/logout") } finally { navigate("/") }
    }

    /* ── Actualizar un filtro individual ── */
    const setFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setCurrentPage(1)
    }

    /* ── Toggle de ordenamiento por fecha ── */
    function toggleSort(column) {
        setSort(prev => {
            if (prev.column !== column) return { column, direction: "asc" }
            if (prev.direction === "asc") return { column, direction: "desc" }
            return { column: null, direction: "asc" }   // tercer clic: quitar orden
        })
    }

    function sortIcon(col) {
        if (sort.column !== col) return "↕"
        return sort.direction === "asc" ? "↑" : "↓"
    }

    /** Abre/cierra el popover de rango de fechas para una columna */
    function toggleDateFilter(col) {
        setOpenDateFilter(prev => prev === col ? null : col)
    }

    /** Limpia los filtros de fecha de una columna */
    function clearDateFilter(col) {
        setFilters(prev => ({ ...prev, [`${col}_desde`]: "", [`${col}_hasta`]: "" }))
        setOpenDateFilter(null)
    }

    /** Retorna true si la columna de fecha tiene algún filtro activo */
    const hasDateFilter = (col) =>
        !!(filters[`${col}_desde`] || filters[`${col}_hasta`])

    /* ── Opciones únicas para los selects de filtro ── */
    const opciones = useMemo(() => ({
        estados: [...new Set(pqrs.map(p => p.tipo_estado).filter(Boolean))],
        tipos: [...new Set(pqrs.map(p => p.tipo_peticion).filter(Boolean))],
        canales: [...new Set(pqrs.map(p => p.tipo_canal).filter(Boolean))],
    }), [pqrs])

    /* ── Funciones auxiliares de filtrado ── */
    const txt = (val, f) => !f || (val || "").toLowerCase().includes(f.toLowerCase())

    /** Verifica si una fecha cae dentro del rango [desde, hasta] */
    const inRange = (fecha, desde, hasta) => {
        if (!desde && !hasta) return true
        const iso = toISO(fecha)
        if (!iso) return true
        if (desde && iso < desde) return false
        if (hasta && iso > hasta) return false
        return true
    }

    /* ── Aplicar filtros y ordenamiento ── */
    const filtradas = useMemo(() => {
        let lista = pqrs.filter(p =>
            txt(p.radicado, filters.radicado) &&
            (!filters.estado || p.tipo_estado === filters.estado) &&
            (!filters.tipo || p.tipo_peticion === filters.tipo) &&
            (!filters.canal || p.tipo_canal === filters.canal) &&
            txt(`${p.nombre} ${p.apellido}`, filters.cliente) &&
            txt(p.cedula, filters.cedula) &&
            txt(p.celular, filters.celular) &&
            inRange(p.fecha_reporte, filters.fecha_reporte_desde, filters.fecha_reporte_hasta) &&
            inRange(p.fecha_evento, filters.fecha_evento_desde, filters.fecha_evento_hasta)
        )

        if (sort.column) {
            lista = [...lista].sort((a, b) => {
                let va, vb
                if (sort.column === "vencimiento") {
                    // Días calendario restantes: menor valor = más urgente primero (asc)
                    va = calcDiasRestantes(a.fecha_reporte) ?? Infinity
                    vb = calcDiasRestantes(b.fecha_reporte) ?? Infinity
                } else {
                    va = new Date(a[sort.column] || 0)
                    vb = new Date(b[sort.column] || 0)
                }
                return sort.direction === "asc" ? va - vb : vb - va
            })
        }

        return lista
    }, [pqrs, filters, sort])

    const totalPages = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE))
    const currentPageSafe = Math.min(currentPage, totalPages)
    const paginadas = filtradas.slice((currentPageSafe - 1) * PAGE_SIZE, currentPageSafe * PAGE_SIZE)

    const hayFiltros = Object.values(filters).some(v => v !== "")

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

    return (
        <div className={styles.layout}>

            <Navbar user={user} onLogout={handleLogout} />

            <main className={styles.main}>

                {/* ── Encabezado de sección ── */}
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>Gestión de PQR</h1>
                        <p className={styles.pageDesc}>Peticiones, Quejas y Reclamos registrados</p>
                    </div>
                    <div className={styles.headerRight}>
                        {hayFiltros && (
                            <button className={styles.clearBtn} onClick={() => setFilters(INIT_FILTERS)}>
                                Limpiar filtros
                            </button>
                        )}
                        <div className={styles.countBadge}>
                            {loading ? "..." : `${filtradas.length} / ${pqrs.length}`}
                        </div>
                    </div>
                </div>

                {/* ── Cards de estadísticas por estado (también funcionan como filtro rápido) ── */}
                {!loading && !error && (
                    <div className={styles.statsRow}>
                        {opciones.estados.map(estado => {
                            const count = pqrs.filter(p => p.tipo_estado === estado).length
                            const st = estadoStyle(estado)
                            const activo = filters.estado === estado
                            return (
                                <button
                                    key={estado}
                                    className={styles.statCard}
                                    style={{
                                        borderColor: st.color + "40",
                                        outline: activo ? `2px solid ${st.color}` : "none",
                                    }}
                                    onClick={() => setFilter("estado", activo ? "" : estado)}
                                    title={activo ? "Quitar filtro" : `Filtrar por: ${estado}`}
                                >
                                    <span className={styles.statCount} style={{ color: st.color }}>{count}</span>
                                    <span className={styles.statLabel}>{estado}</span>
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* ── Estado de carga y error ── */}
                {loading && (
                    <div className={styles.stateBox}>
                        <div className={styles.spinner} />
                        <p>Cargando PQRs...</p>
                    </div>
                )}

                {error && <div className={styles.errorBox}>{error}</div>}

                {/* ── Tabla ── */}
                {!loading && !error && (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>

                                {/* Fila 1: Títulos de columna */}
                                <tr className={styles.headerRow}>
                                    <th>Radicado</th>
                                    <th>Estado</th>
                                    <th>Tipo</th>
                                    <th>Canal</th>
                                    <th>Cliente</th>
                                    <th>Cédula</th>
                                    <th>Celular</th>
                                    {/* Fecha Reporte: sort + botón popover de rango */}
                                    <th className={styles.dateHeaderTh}>
                                        <div className={styles.dateHeaderInner}>
                                            <button className={styles.sortBtn} onClick={() => toggleSort("fecha_reporte")}>
                                                Fecha Reporte <span>{sortIcon("fecha_reporte")}</span>
                                            </button>
                                            <button
                                                className={`${styles.dateFilterBtn} ${hasDateFilter("fecha_reporte") ? styles.dateFilterActive : ""}`}
                                                onClick={e => { e.stopPropagation(); toggleDateFilter("fecha_reporte") }}
                                                title="Filtrar por rango"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                            </button>
                                        </div>
                                        {/* Popover de rango de fechas */}
                                        {openDateFilter === "fecha_reporte" && (
                                            <div className={styles.datePopover}>
                                                <div className={styles.popoverTitle}>Rango — Fecha Reporte</div>
                                                <div className={styles.popoverField}>
                                                    <label>Desde</label>
                                                    <input type="date" className={styles.popoverInput}
                                                        value={filters.fecha_reporte_desde}
                                                        onChange={e => setFilter("fecha_reporte_desde", e.target.value)} />
                                                </div>
                                                <div className={styles.popoverField}>
                                                    <label>Hasta</label>
                                                    <input type="date" className={styles.popoverInput}
                                                        value={filters.fecha_reporte_hasta}
                                                        onChange={e => setFilter("fecha_reporte_hasta", e.target.value)} />
                                                </div>
                                                <button className={styles.popoverClearBtn} onClick={() => clearDateFilter("fecha_reporte")}>
                                                    Limpiar
                                                </button>
                                            </div>
                                        )}
                                    </th>

                                    {/* Fecha Evento: sort + botón popover de rango */}
                                    <th className={styles.dateHeaderTh}>
                                        <div className={styles.dateHeaderInner}>
                                            <button className={styles.sortBtn} onClick={() => toggleSort("fecha_evento")}>
                                                Fecha Evento <span>{sortIcon("fecha_evento")}</span>
                                            </button>
                                            <button
                                                className={`${styles.dateFilterBtn} ${hasDateFilter("fecha_evento") ? styles.dateFilterActive : ""}`}
                                                onClick={e => { e.stopPropagation(); toggleDateFilter("fecha_evento") }}
                                                title="Filtrar por rango"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                            </button>
                                        </div>
                                        {openDateFilter === "fecha_evento" && (
                                            <div className={styles.datePopover}>
                                                <div className={styles.popoverTitle}>Rango — Fecha Evento</div>
                                                <div className={styles.popoverField}>
                                                    <label>Desde</label>
                                                    <input type="date" className={styles.popoverInput}
                                                        value={filters.fecha_evento_desde}
                                                        onChange={e => setFilter("fecha_evento_desde", e.target.value)} />
                                                </div>
                                                <div className={styles.popoverField}>
                                                    <label>Hasta</label>
                                                    <input type="date" className={styles.popoverInput}
                                                        value={filters.fecha_evento_hasta}
                                                        onChange={e => setFilter("fecha_evento_hasta", e.target.value)} />
                                                </div>
                                                <button className={styles.popoverClearBtn} onClick={() => clearDateFilter("fecha_evento")}>
                                                    Limpiar
                                                </button>
                                            </div>
                                        )}
                                    </th>

                                    <th>
                                        <button className={styles.sortBtn} onClick={() => toggleSort("vencimiento")}>
                                            Vencimiento <span>{sortIcon("vencimiento")}</span>
                                        </button>
                                    </th>
                                    <th>Acción</th>
                                </tr>

                                {/* Fila 2: Inputs de filtro por columna */}
                                <tr className={styles.filterRow}>
                                    <th>
                                        <input className={styles.fi} type="text" placeholder="Buscar..."
                                            value={filters.radicado} onChange={e => setFilter("radicado", e.target.value)} />
                                    </th>
                                    <th>
                                        <select className={styles.fi} value={filters.estado}
                                            onChange={e => setFilter("estado", e.target.value)}>
                                            <option value="">Todos</option>
                                            {opciones.estados.map(e => <option key={e} value={e}>{e}</option>)}
                                        </select>
                                    </th>
                                    <th>
                                        <select className={styles.fi} value={filters.tipo}
                                            onChange={e => setFilter("tipo", e.target.value)}>
                                            <option value="">Todos</option>
                                            {opciones.tipos.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </th>
                                    <th>
                                        <select className={styles.fi} value={filters.canal}
                                            onChange={e => setFilter("canal", e.target.value)}>
                                            <option value="">Todos</option>
                                            {opciones.canales.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </th>
                                    <th>
                                        <input className={styles.fi} type="text" placeholder="Nombre..."
                                            value={filters.cliente} onChange={e => setFilter("cliente", e.target.value)} />
                                    </th>
                                    <th>
                                        <input className={styles.fi} type="text" placeholder="Cédula..."
                                            value={filters.cedula} onChange={e => setFilter("cedula", e.target.value)} />
                                    </th>
                                    <th>
                                        <input className={styles.fi} type="text" placeholder="Celular..."
                                            value={filters.celular} onChange={e => setFilter("celular", e.target.value)} />
                                    </th>
                                    {/* Celdas vacías bajo los encabezados de fecha/vencimiento */}
                                    <th />
                                    <th />
                                    <th />
                                    <th />
                                </tr>
                            </thead>

                            <tbody>
                                {filtradas.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" className={styles.emptyRow}>
                                            No se encontraron PQRs con los filtros aplicados
                                        </td>
                                    </tr>
                                ) : (
                                    paginadas.map(pqr => {
                                        const st = estadoStyle(pqr.tipo_estado)
                                        return (
                                            <tr key={pqr.id_pqr} className={styles.row}>
                                                {/* Radicado: clic abre modal de detalle */}
                                                <td>
                                                    <button
                                                        className={styles.radicadoBtn}
                                                        onClick={() => setSelectedPqr(pqr)}
                                                        title="Ver detalle"
                                                    >
                                                        {pqr.radicado}
                                                    </button>
                                                </td>
                                                <td>
                                                    <span className={styles.estadoBadge}
                                                        style={{ background: st.bg, color: st.color }}>
                                                        {pqr.tipo_estado}
                                                    </span>
                                                </td>
                                                <td>{pqr.tipo_peticion}</td>
                                                <td>{pqr.tipo_canal}</td>
                                                <td>
                                                    <div className={styles.clienteNombre}>{pqr.nombre} {pqr.apellido}</div>
                                                    <div className={styles.clienteDireccion}>{pqr.direccion}</div>
                                                </td>
                                                <td className={styles.monoCell}>{pqr.cedula}</td>
                                                <td>{pqr.celular}</td>
                                                <td className={styles.fechaCell}>{formatFecha(pqr.fecha_reporte)}</td>
                                                <td className={styles.fechaCell}>{formatFecha(pqr.fecha_evento)}</td>
                                                {/* Badge de días restantes (15 días hábiles desde fecha_reporte) */}
                                                <td>
                                                    {(() => {
                                                        const dias = calcDiasRestantes(pqr.fecha_reporte)
                                                        const vs = vencimientoStyle(dias)
                                                        if (!vs) return "—"
                                                        return (
                                                            <span
                                                                className={styles.vencimientoBadge}
                                                                style={{ background: vs.bg, color: vs.color }}
                                                                title={dias <= 0 ? "Plazo vencido" : `${dias} día(s) calendario restantes`}
                                                            >
                                                                {vs.label}
                                                            </span>
                                                        )
                                                    })()}
                                                </td>
                                                {/* Botón editar → va a la página de gestión */}
                                                <td>
                                                    <button
                                                        className={styles.editBtn}
                                                        onClick={() => navigate(`/pqr/${pqr.id_pqr}`)}
                                                        title="Gestionar PQR"
                                                    >
                                                        Gestionar
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>

                        <div className={styles.paginationBar}>
                            <div className={styles.paginationInfo}>
                                Mostrando {filtradas.length === 0 ? 0 : (currentPageSafe - 1) * PAGE_SIZE + 1} - {Math.min(currentPageSafe * PAGE_SIZE, filtradas.length)} de {filtradas.length}
                            </div>

                            <div className={styles.paginationActions}>
                                <button
                                    className={styles.pageBtn}
                                    disabled={currentPageSafe <= 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                >Anterior</button>

                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1
                                    return (
                                        <button
                                            key={page}
                                            className={`${styles.pageBtn} ${currentPageSafe === page ? styles.activePageBtn : ""}`}
                                            onClick={() => setCurrentPage(page)}
                                        >{page}</button>
                                    )
                                })}

                                <button
                                    className={styles.pageBtn}
                                    disabled={currentPageSafe >= totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                >Siguiente</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Overlay transparente: cierra el popover de fecha al hacer clic fuera */}
            {openDateFilter && (
                <div
                    style={{ position: "fixed", inset: 0, zIndex: 90 }}
                    onClick={() => setOpenDateFilter(null)}
                />
            )}

            {/* ── Modal de detalle (al hacer clic en radicado) ── */}
            {selectedPqr && (
                <PQRDetailModal
                    pqr={selectedPqr}
                    onClose={() => setSelectedPqr(null)}
                />
            )}

            {/* ── Modal crear usuario (solo admin) ── */}
            {showCreateUser && (
                <CreateUserModal
                    onClose={() => setShowCreateUser(false)}
                />
            )}

            {/* ── Drawer nueva PQR ── */}
            {showCreatePQR && (
                <CreatePQRModal
                    onClose={() => setShowCreatePQR(false)}
                    onSuccess={() => {
                        // Refresca la lista de PQRs al crear una nueva
                        api.get("/api/pqr")
                            .then(res => setPqrs(res.data))
                            .catch(() => { })
                    }}
                />
            )}

            {/* ── Barra inferior de navegación ── */}
            <BottomBar
                user={user}
                onCreateUser={() => setShowCreateUser(true)}
                onCreatePQR={() => setShowCreatePQR(true)}
            />
        </div>
    )
}
