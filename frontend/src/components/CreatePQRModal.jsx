/**
 * CreatePQRModal — Drawer lateral para registrar una PQR desde el sistema interno.
 *
 * Contiene los mismos campos que el formulario público (/nueva-pqr).
 * Se desliza desde la derecha y es completamente scrollable.
 *
 * Props:
 *   - onClose    : cierra el drawer
 *   - onSuccess  : (opcional) callback llamado al crear exitosamente → para refrescar la lista
 */
import { useEffect, useState } from "react"
import api from "../api/axios"
import { fechaHoy } from "../utils/fechas"
import styles from "./CreatePQRModal.module.css"

/* Texto legal completo */
const TEXTO_LEGAL = `De acuerdo con la ley 1581 de 2012, sus normas concordantes y reglamentarias, declaro que soy mayor de edad y soy consciente que debo presentar evidencia o soporte en caso de ser requerido para realizar este trámite. En forma previa, libre, voluntaria, informada, expresa, y debidamente prevenido(a) sobre mis derechos como titular, autorizo a SUSUERTE S.A para recolectar, almacenar, dar tratamiento, actualizar, disponer, transmitir y transferir, mis datos personales, mi imagen y documentos adjuntos propios y de terceros, de los cuales tengo autorización; que se incorporarán en sus bases de datos, para gestionar y tramitar PQRSF (durante y después); contactarme para realizar encuestas, calificación y consultas; ofrecerme servicios en general; remitir información comercial y de marketing; y para todos los fines legales pertinentes. Sé que cuando me pregunten por datos sensibles o de menores de edad, tengo la facultad de dar o no respuesta. Tengo derecho a conocer, actualizar, rectificar y suprimir mis datos, a la cuenta de correo electrónico servicioalcliente@susuerte.com, o la dirección Carrera 23C No. 64 – 32 Manizales – Caldas, también conozco que puedo consultar el Manual de Políticas de Tratamiento de Datos Personales en la página web www.susuerte.com`

const getInitialForm = () => ({
    fecha_reporte:    fechaHoy(),
    fecha_evento:     "",
    id_canal:         "",
    nombre:           "",
    apellido:         "",
    cedula:           "",
    direccion:        "",
    correo:           "",
    celular:          "",
    id_municipio:     "",
    nombre_vendedor:  "",
    cedula_vendedor:  "",
    celular_vendedor: "",
    id_tipo_peticion: "",
    descripcion:      "",
    acepta_terminos:  false,
})

export default function CreatePQRModal({ onClose, onSuccess }) {
    /* ── Catálogos ── */
    const [canales,    setCanales]    = useState([])
    const [municipios, setMunicipios] = useState([])
    const [tipos,      setTipos]      = useState([])
    const [loadCat,    setLoadCat]    = useState(true)

    /* ── Formulario ── */
    const [form,       setForm]       = useState(getInitialForm)
    const [archivos,   setArchivos]   = useState([])
    const [enviando,   setEnviando]   = useState(false)
    const [error,      setError]      = useState("")
    const [radicadoOk, setRadicadoOk] = useState(null)

    /* ── Cargar catálogos al abrir ── */
    useEffect(() => {
        Promise.all([
            api.get("/api/catalogos/canales"),
            api.get("/api/catalogos/municipios"),
            api.get("/api/catalogos/tipo_peticion"),
        ]).then(([resC, resM, resT]) => {
            setCanales(resC.data)
            setMunicipios(resM.data)
            setTipos(resT.data)
        }).catch(() => {
            setError("No se pudieron cargar las opciones del formulario.")
        }).finally(() => setLoadCat(false))
    }, [])

    /* ── Cerrar con Escape ── */
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose() }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [onClose])

    const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

    /* ── Enviar formulario ── */
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        if (!form.acepta_terminos) {
            setError("Debe aceptar los términos y condiciones para continuar.")
            return
        }
        setEnviando(true)
        try {
            const formData = new FormData()
            Object.entries(form).forEach(([k, v]) => formData.append(k, v))
            formData.set("id_canal",         parseInt(form.id_canal))
            formData.set("id_tipo_peticion", parseInt(form.id_tipo_peticion))
            formData.set("id_municipio",     form.id_municipio ? parseInt(form.id_municipio) : "")
            formData.set("acepta_terminos",  true)
            archivos.forEach(a => formData.append("archivos", a))

            const res = await api.post("/api/pqr/public", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            setRadicadoOk(res.data.radicado)
            onSuccess?.()   // notifica al padre para que refresque la lista
        } catch (err) {
            setError(err.response?.data?.message || "Ocurrió un error al registrar la PQR.")
        } finally {
            setEnviando(false)
        }
    }

    const quitarArchivo = (i) => setArchivos(prev => prev.filter((_, idx) => idx !== i))

    /* ── Crear otra PQR ── */
    const handleNueva = () => {
        setRadicadoOk(null)
        setForm(getInitialForm())
        setArchivos([])
        setError("")
    }

    return (
        <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <aside className={styles.drawer}>

                {/* ── Encabezado del drawer ── */}
                <div className={styles.drawerHeader}>
                    <div className={styles.drawerHeaderLeft}>
                        <div className={styles.drawerIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </div>
                        <div>
                            <div className={styles.drawerTitle}>Nueva PQR</div>
                            <div className={styles.drawerSub}>Registrar petición, queja o reclamo</div>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                {/* ── Estado: éxito ── */}
                {radicadoOk ? (
                    <div className={styles.successPanel}>
                        <div className={styles.successIcon}>✓</div>
                        <h2 className={styles.successTitle}>¡PQR registrada!</h2>
                        <p className={styles.successDesc}>
                            La solicitud fue registrada exitosamente con el siguiente número de radicado:
                        </p>
                        <div className={styles.radicado}>{radicadoOk}</div>
                        <p className={styles.radicadoHint}>Número de radicado</p>
                        <div className={styles.successBtns}>
                            <button className={styles.btnSecondary} onClick={handleNueva}>
                                Registrar otra PQR
                            </button>
                            <button className={styles.btnPrimary} onClick={onClose}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ── Formulario ── */
                    <form onSubmit={handleSubmit} className={styles.form} noValidate>

                        {loadCat && <div className={styles.loadingCat}>Cargando opciones...</div>}
                        {error   && <div className={styles.errorBox}>{error}</div>}

                        {/* ══ Sección 1: Fechas y canal ══ */}
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>Información de la solicitud</div>
                            <div className={styles.grid2}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Fecha del reporte <span className={styles.req}>*</span></label>
                                    <input type="date" className={styles.input} required
                                        value={form.fecha_reporte}
                                        onChange={e => setField("fecha_reporte", e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Fecha del evento</label>
                                    <input type="date" className={styles.input}
                                        value={form.fecha_evento}
                                        onChange={e => setField("fecha_evento", e.target.value)} />
                                </div>
                            </div>
                            <div className={styles.field} style={{ marginTop: "12px" }}>
                                <label className={styles.label}>¿Dónde se registra la PQRSF? <span className={styles.req}>*</span></label>
                                <select className={styles.select} required
                                    value={form.id_canal}
                                    onChange={e => setField("id_canal", e.target.value)}>
                                    <option value="">Seleccionar canal...</option>
                                    {canales.map(c => (
                                        <option key={c.id_canal} value={c.id_canal}>{c.tipo_canal}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* ══ Sección 2: Datos del cliente ══ */}
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>Datos del solicitante</div>
                            <div className={styles.grid2}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Nombre <span className={styles.req}>*</span></label>
                                    <input type="text" className={styles.input} required placeholder="Nombre(s)"
                                        value={form.nombre}
                                        onChange={e => setField("nombre", e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Apellido <span className={styles.req}>*</span></label>
                                    <input type="text" className={styles.input} required placeholder="Apellido(s)"
                                        value={form.apellido}
                                        onChange={e => setField("apellido", e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Cédula <span className={styles.req}>*</span></label>
                                    <input type="text" className={styles.input} required placeholder="Ej: 1234567890"
                                        value={form.cedula}
                                        onChange={e => setField("cedula", e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Dirección</label>
                                    <input type="text" className={styles.input} placeholder="Dirección de residencia"
                                        value={form.direccion}
                                        onChange={e => setField("direccion", e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Correo electrónico</label>
                                    <input type="email" className={styles.input} placeholder="correo@ejemplo.com"
                                        value={form.correo}
                                        onChange={e => setField("correo", e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Celular</label>
                                    <input type="tel" className={styles.input} placeholder="Ej: 3001234567"
                                        value={form.celular}
                                        onChange={e => setField("celular", e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Municipio</label>
                                    <select className={styles.select}
                                        value={form.id_municipio}
                                        onChange={e => setField("id_municipio", e.target.value)}>
                                        <option value="">Seleccionar municipio...</option>
                                        {municipios.map(m => (
                                            <option key={m.id_municipio} value={m.id_municipio}>{m.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ══ Sección 3: Datos opcionales del vendedor ══ */}
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>
                                Información del vendedor
                                <span className={styles.opcional}> — opcional</span>
                            </div>
                            <div className={styles.grid2}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Nombre del vendedor</label>
                                    <input type="text" className={styles.input} placeholder="Nombre completo"
                                        value={form.nombre_vendedor}
                                        onChange={e => setField("nombre_vendedor", e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Identificación</label>
                                    <input type="text" className={styles.input} placeholder="Cédula / NIT"
                                        value={form.cedula_vendedor}
                                        onChange={e => setField("cedula_vendedor", e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Celular del vendedor</label>
                                    <input type="tel" className={styles.input} placeholder="Ej: 3001234567"
                                        value={form.celular_vendedor}
                                        onChange={e => setField("celular_vendedor", e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* ══ Sección 4: Tipo y descripción ══ */}
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>Detalle de la solicitud</div>
                            <div className={styles.field}>
                                <label className={styles.label}>Tipo de solicitud <span className={styles.req}>*</span></label>
                                <select className={styles.select} required
                                    value={form.id_tipo_peticion}
                                    onChange={e => setField("id_tipo_peticion", e.target.value)}>
                                    <option value="">Seleccionar tipo...</option>
                                    {tipos.map(t => (
                                        <option key={t.id_tipo_peticion} value={t.id_tipo_peticion}>{t.tipo_peticion}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.field} style={{ marginTop: "12px" }}>
                                <label className={styles.label}>Descripción <span className={styles.req}>*</span></label>
                                <textarea className={styles.textarea} required rows={6}
                                    placeholder="Describa detalladamente su petición, queja, reclamo, sugerencia o felicitación..."
                                    value={form.descripcion}
                                    onChange={e => setField("descripcion", e.target.value)} />
                            </div>
                            <div className={styles.field} style={{ marginTop: "12px" }}>
                                <label className={styles.label}>Documentos de soporte <span className={styles.opcional}> — opcional</span></label>
                                <label className={styles.fileInputLabel}>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf,.doc,.docx"
                                        className={styles.fileInputHidden}
                                        onChange={e => setArchivos(prev => [...prev, ...Array.from(e.target.files)])}
                                    />
                                    Adjuntar archivos
                                </label>
                                <p className={styles.fileHint}>Imágenes, PDF o Word · Máx. 10 MB · Máx. 5 archivos</p>
                                {archivos.length > 0 && (
                                    <ul className={styles.fileList}>
                                        {archivos.map((f, i) => (
                                            <li key={i} className={styles.fileItem}>
                                                <span>{f.type.startsWith("image/") ? "🖼" : "📄"}</span>
                                                <span className={styles.fileName}>{f.name}</span>
                                                <button type="button" className={styles.fileRemove} onClick={() => quitarArchivo(i)}>✕</button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* ══ Sección 5: Términos ══ */}
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>Autorización de tratamiento de datos</div>
                            <div className={styles.legalBox}>
                                <p className={styles.legalText}>{TEXTO_LEGAL}</p>
                            </div>
                            <label className={`${styles.terminosLabel} ${form.acepta_terminos ? styles.terminosActivo : ""}`}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={form.acepta_terminos}
                                    onChange={e => setField("acepta_terminos", e.target.checked)}
                                />
                                Acepto los términos y condiciones y autorizo el tratamiento de mis datos personales
                            </label>
                        </div>

                        {/* ── Botones de acción ── */}
                        <div className={styles.actions}>
                            <button type="button" className={styles.btnSecondary} onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="submit" className={styles.btnPrimary}
                                disabled={enviando || !form.acepta_terminos}>
                                {enviando ? "Registrando..." : "Registrar PQR"}
                            </button>
                        </div>

                    </form>
                )}
            </aside>
        </div>
    )
}
