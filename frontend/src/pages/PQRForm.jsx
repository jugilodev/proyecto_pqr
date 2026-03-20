/**
 * PQRForm — Formulario público para radicación de PQRs.
 *
 * Accesible sin autenticación en /nueva-pqr.
 * Al enviar muestra un modal de confirmación con el número de radicado.
 */
import { useEffect, useState } from "react"
import api from "../api/axios"
import { fechaHoy } from "../utils/fechas"
import styles from "./PQRForm.module.css"

/* Texto legal completo */
const TEXTO_LEGAL = `De acuerdo con la ley 1581 de 2012, sus normas concordantes y reglamentarias, declaro que soy mayor de edad y soy consciente que debo presentar evidencia o soporte en caso de ser requerido para realizar este trámite. En forma previa, libre, voluntaria, informada, expresa, y debidamente prevenido(a) sobre mis derechos como titular, autorizo a SUSUERTE S.A para recolectar, almacenar, dar tratamiento, actualizar, disponer, transmitir y transferir, mis datos personales, mi imagen y documentos adjuntos propios y de terceros, de los cuales tengo autorización; que se incorporarán en sus bases de datos, para gestionar y tramitar PQRSF (durante y después); contactarme para realizar encuestas, calificación y consultas; ofrecerme servicios en general; remitir información comercial y de marketing; y para todos los fines legales pertinentes. Sé que cuando me pregunten por datos sensibles o de menores de edad, tengo la facultad de dar o no respuesta. Tengo derecho a conocer, actualizar, rectificar y suprimir mis datos, a la cuenta de correo electrónico servicioalcliente@susuerte.com, o la dirección Carrera 23C No. 64 – 32 Manizales – Caldas, también conozco que puedo consultar el Manual de Políticas de Tratamiento de Datos Personales en la página web www.susuerte.com`

/** Genera el estado inicial del formulario con la fecha de hoy pre-cargada. */
const getInitialForm = () => ({
    fecha_reporte:    fechaHoy(),   // se llena automáticamente con la fecha actual
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

export default function PQRForm() {
    /* ── Catálogos desde la API ── */
    const [canales,   setCanales]   = useState([])
    const [municipios, setMunicipios] = useState([])
    const [tipos,     setTipos]     = useState([])

    /* ── Estado del formulario ── */
    const [form,         setForm]         = useState(getInitialForm)
    const [archivos,     setArchivos]     = useState([])
    const [enviando,     setEnviando]      = useState(false)
    const [error,        setError]         = useState("")
    const [radicadoOk,   setRadicadoOk]    = useState(null)  // radicado confirmado → abre modal

    /* ── Carga de catálogos al montar ── */
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
            setError("No se pudieron cargar las opciones del formulario. Intente más tarde.")
        })
    }, [])

    /* ── Actualizar un campo individual ── */
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

            // Notificar al webhook externo (no bloquea ni afecta el flujo si falla)
            const canalNombre    = canales.find(c => String(c.id_canal)         === String(form.id_canal))?.tipo_canal         ?? ""
            const municipioNombre = municipios.find(m => String(m.id_municipio) === String(form.id_municipio))?.nombre          ?? ""
            const tipoNombre     = tipos.find(t => String(t.id_tipo_peticion)   === String(form.id_tipo_peticion))?.tipo_peticion ?? ""

            fetch("https://n8n.susuerte.com/webhook/783e7a4e-1811-43b0-990a-7c3e17e8adc5", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    radicado:         res.data.radicado,
                    fecha_reporte:    form.fecha_reporte,
                    fecha_evento:     form.fecha_evento,
                    canal:            canalNombre,
                    nombre:           form.nombre,
                    apellido:         form.apellido,
                    cedula:           form.cedula,
                    direccion:        form.direccion,
                    correo:           form.correo,
                    celular:          form.celular,
                    municipio:        municipioNombre,
                    nombre_vendedor:  form.nombre_vendedor,
                    cedula_vendedor:  form.cedula_vendedor,
                    celular_vendedor: form.celular_vendedor,
                    tipo_peticion:    tipoNombre,
                    descripcion:      form.descripcion,
                }),
            }).catch(() => {})

        } catch (err) {
            setError(err.response?.data?.message || "Ocurrió un error al registrar su solicitud. Intente de nuevo.")
        } finally {
            setEnviando(false)
        }
    }

    const quitarArchivo = (i) => setArchivos(prev => prev.filter((_, idx) => idx !== i))

    /* ── Cerrar modal y resetear formulario ── */
    const handleCerrarModal = () => {
        setRadicadoOk(null)
        setForm(getInitialForm())
        setArchivos([])
    }

    return (
        <div className={styles.page}>

            {/* ── Encabezado institucional ── */}
            <header className={styles.header}>
                <div className={styles.headerLogo}>
                    <div className={styles.logoBox}>S</div>
                    <div>
                        <div className={styles.logoNombre}>SUSUERTE S.A.</div>
                        <div className={styles.logoSub}>Sistema de PQRSF</div>
                    </div>
                </div>
                <h1 className={styles.headerTitle}>Registro de Petición, Queja, Reclamo, Sugerencia o Felicitación</h1>
            </header>

            <main className={styles.main}>
                {error && <div className={styles.globalError}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form} noValidate>

                    {/* ══ Sección 1: Fechas y canal ══ */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Información de la solicitud</h2>
                        <div className={styles.grid3}>
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
                            <div className={styles.field}>
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
                    </div>

                    {/* ══ Sección 2: Datos del cliente ══ */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Datos del solicitante</h2>
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
                                <label className={styles.label}>Número de cédula <span className={styles.req}>*</span></label>
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
                        <h2 className={styles.sectionTitle}>
                            Información del vendedor
                            <span className={styles.sectionOpcional}> — opcional</span>
                        </h2>
                        <div className={styles.grid3}>
                            <div className={styles.field}>
                                <label className={styles.label}>Nombre del vendedor</label>
                                <input type="text" className={styles.input} placeholder="Nombre completo"
                                    value={form.nombre_vendedor}
                                    onChange={e => setField("nombre_vendedor", e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Identificación del vendedor</label>
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
                        <h2 className={styles.sectionTitle}>Detalle de la solicitud</h2>
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
                        <div className={styles.field} style={{ marginTop: "16px" }}>
                            <label className={styles.label}>Descripción de la PQRSF <span className={styles.req}>*</span></label>
                            <textarea className={styles.textarea} required rows={6}
                                placeholder="Describa detalladamente su petición, queja, reclamo, sugerencia o felicitación..."
                                value={form.descripcion}
                                onChange={e => setField("descripcion", e.target.value)} />
                        </div>
                        <div className={styles.field} style={{ marginTop: "16px" }}>
                            <label className={styles.label}>Documentos de soporte <span style={{ fontWeight: 400, color: "#9ca3af" }}>(opcional)</span></label>
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
                            <p className={styles.fileHint}>Imágenes, PDF o Word · Máx. 10 MB por archivo · Máx. 5 archivos</p>
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

                    {/* ══ Sección 5: Términos y condiciones ══ */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Autorización de tratamiento de datos</h2>
                        <div className={styles.legalBox}>
                            <p className={styles.legalText}>{TEXTO_LEGAL}</p>
                        </div>
                        <div className={styles.terminosRow}>
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
                    </div>

                    {/* ── Botón de envío ── */}
                    <div className={styles.submitRow}>
                        <button type="submit" className={styles.submitBtn} disabled={enviando || !form.acepta_terminos}>
                            {enviando ? "Registrando solicitud..." : "Enviar solicitud"}
                        </button>
                    </div>

                </form>
            </main>

            {/* ══ Modal de confirmación ══ */}
            {radicadoOk && (
                <div className={styles.modalOverlay} onClick={handleCerrarModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalIcon}>✓</div>
                        <h2 className={styles.modalTitle}>¡Solicitud registrada!</h2>
                        <p className={styles.modalDesc}>
                            Su PQRSF ha sido registrada exitosamente. Guarde su número de radicado para hacer seguimiento.
                        </p>
                        <div className={styles.modalRadicado}>{radicadoOk}</div>
                        <p className={styles.modalHint}>Número de radicado</p>
                        <button className={styles.modalBtn} onClick={handleCerrarModal}>
                            Aceptar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
