/**
 * utils/fechas.js
 *
 * Utilidades de fechas para el sistema de PQR.
 *
 * Contiene:
 *   - Cálculo de festivos colombianos (Ley Emiliani + Semana Santa)
 *   - Cálculo de días hábiles (lunes-viernes sin festivos)
 *   - Cálculo de días calendario restantes para el vencimiento de PQRs
 *   - Helper de formato de fechas
 *   - Helper de fecha de hoy en formato ISO
 */

// ── Helpers internos ────────────────────────────────────────────────────────

/** Convierte una Date a "YYYY-MM-DD" (clave de Set y comparaciones). */
function isoStr(date) {
    const d = new Date(date)
    d.setHours(12, 0, 0, 0)
    return d.toISOString().split("T")[0]
}

/** Suma N días calendario a una fecha, devuelve nueva Date. */
function sumarDias(date, n) {
    const d = new Date(date)
    d.setDate(d.getDate() + n)
    return d
}

/**
 * Devuelve el lunes siguiente a la fecha dada.
 * Si la fecha ya es lunes la devuelve sin modificar.
 * Se usa para implementar la Ley Emiliani.
 */
function siguienteLunes(date) {
    const d   = new Date(date)
    const dow = d.getDay()   // 0=dom … 6=sáb
    if (dow === 1) return d  // ya es lunes
    const diff = dow === 0 ? 1 : 8 - dow
    d.setDate(d.getDate() + diff)
    return d
}

// ── Pascua ───────────────────────────────────────────────────────────────────

/**
 * Calcula la fecha de Pascua de un año usando el algoritmo anónimo gregoriano.
 * Necesario para los festivos de Semana Santa y los que dependen de ella.
 */
function pascua(year) {
    const a = year % 19
    const b = Math.floor(year / 100)
    const c = year % 100
    const d = Math.floor(b / 4)
    const e = b % 4
    const f = Math.floor((b + 8) / 25)
    const g = Math.floor((b - f + 1) / 3)
    const h = (19 * a + b - d - g + 15) % 30
    const i = Math.floor(c / 4)
    const k = c % 4
    const l = (32 + 2 * e + 2 * i - h - k) % 7
    const m = Math.floor((a + 11 * h + 22 * l) / 451)
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1  // 0-based
    const day   = ((h + l - 7 * m + 114) % 31) + 1
    return new Date(year, month, day, 12)
}

// ── Festivos colombianos ─────────────────────────────────────────────────────

/**
 * Retorna un Set<string> con todas las fechas festivas colombianas del año
 * en formato "YYYY-MM-DD".
 *
 * Tipos de festivo:
 *   1. Fecha fija      — siempre caen el mismo día del mes.
 *   2. Ley Emiliani    — si no caen en lunes, se trasladan al lunes siguiente.
 *   3. Semana Santa    — calculados a partir de la fecha de Pascua.
 */
export function festivosColombia(year) {
    const festivos = new Set()
    const add = (date) => festivos.add(isoStr(date))

    // ── Festivos de fecha fija ──────────────────────────────
    add(new Date(year,  0,  1, 12))  // Año Nuevo
    add(new Date(year,  4,  1, 12))  // Día del Trabajo
    add(new Date(year,  6, 20, 12))  // Independencia de Colombia
    add(new Date(year,  7,  7, 12))  // Batalla de Boyacá
    add(new Date(year, 11,  8, 12))  // Inmaculada Concepción
    add(new Date(year, 11, 25, 12))  // Navidad

    // ── Festivos Ley Emiliani (se trasladan al lunes siguiente) ──
    add(siguienteLunes(new Date(year,  0,  6, 12)))  // Reyes Magos
    add(siguienteLunes(new Date(year,  2, 19, 12)))  // San José
    add(siguienteLunes(new Date(year,  5, 29, 12)))  // San Pedro y San Pablo
    add(siguienteLunes(new Date(year,  7, 15, 12)))  // Asunción de la Virgen
    add(siguienteLunes(new Date(year,  9, 12, 12)))  // Día de la Raza
    add(siguienteLunes(new Date(year, 10,  1, 12)))  // Todos los Santos
    add(siguienteLunes(new Date(year, 10, 11, 12)))  // Independencia de Cartagena

    // ── Festivos basados en Semana Santa ────────────────────
    const p = pascua(year)
    add(sumarDias(p, -3))                   // Jueves Santo
    add(sumarDias(p, -2))                   // Viernes Santo
    add(siguienteLunes(sumarDias(p,  39)))  // Ascensión (Emiliani)
    add(siguienteLunes(sumarDias(p,  60)))  // Corpus Christi (Emiliani)
    add(siguienteLunes(sumarDias(p,  68)))  // Sagrado Corazón (Emiliani)

    return festivos
}

// ── Días hábiles y vencimiento ───────────────────────────────────────────────

/**
 * Suma N días hábiles (lunes-viernes, excluye festivos colombianos)
 * a la fecha de inicio. Devuelve la fecha límite como Date.
 */
export function addBusinessDays(start, days) {
    const d = new Date(start)
    d.setHours(12, 0, 0, 0)

    // Pre-cargar festivos del año de inicio y el siguiente
    // para cubrir el caso en que el plazo cruce de año.
    const yearInicio = d.getFullYear()
    const festivos   = new Set([
        ...festivosColombia(yearInicio),
        ...festivosColombia(yearInicio + 1),
    ])

    let added = 0
    while (added < days) {
        d.setDate(d.getDate() + 1)
        const dow = d.getDay()
        // Sábado(6) y Domingo(0) no son hábiles
        if (dow !== 0 && dow !== 6 && !festivos.has(isoStr(d))) added++
    }
    return d
}

/**
 * Calcula los días CALENDARIO restantes desde hoy hasta el vencimiento legal
 * de una PQR (15 días hábiles desde fecha_reporte).
 *
 * Retorna null si no hay fecha.
 * Retorna 0 o negativo si ya venció.
 */
export function calcDiasRestantes(fechaReporte) {
    if (!fechaReporte) return null
    const deadline = addBusinessDays(new Date(fechaReporte), 15)
    const today    = new Date()
    today.setHours(12, 0, 0, 0)
    return Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
}

/**
 * Retorna { bg, color, label } para el badge de vencimiento según los días restantes.
 *   > 7d  → verde   (holgada)
 *   3-7d  → naranja (atención)
 *   1-2d  → rojo    (urgente)
 *   ≤ 0d  → rojo oscuro (vencida)
 */
export function vencimientoStyle(dias) {
    if (dias === null) return null
    if (dias > 7)  return { bg: "#dcfce7", color: "#15803d", label: `${dias}d` }
    if (dias >= 3) return { bg: "#ffedd5", color: "#c2410c", label: `${dias}d` }
    if (dias >= 1) return { bg: "#fee2e2", color: "#b91c1c", label: `${dias}d` }
    return { bg: "#7f1d1d", color: "#fef2f2", label: "Vencida" }
}

// ── Formato ──────────────────────────────────────────────────────────────────

/**
 * Formatea una fecha a "dd/mm/yyyy" en español colombiano.
 * Devuelve "—" si la fecha es nula/inválida.
 */
export function formatFecha(fecha) {
    if (!fecha) return "—"
    return new Date(fecha).toLocaleDateString("es-CO", {
        day: "2-digit", month: "2-digit", year: "numeric",
    })
}

/**
 * Devuelve la fecha de hoy en formato "YYYY-MM-DD" (para usar como
 * valor inicial en inputs type="date").
 */
export function fechaHoy() {
    return new Date().toISOString().split("T")[0]
}
