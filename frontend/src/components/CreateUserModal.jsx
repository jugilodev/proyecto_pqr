/**
 * CreateUserModal — Modal para crear un nuevo usuario del sistema.
 *
 * Solo visible para usuarios con rol "admin".
 * Llama a POST /api/usuarios con los datos del formulario.
 *
 * Props:
 *   - onClose: función para cerrar el modal
 *   - onSuccess: (opcional) función a llamar si el usuario se creó exitosamente
 */
import { useState } from "react"
import api from "../api/axios"
import styles from "./CreateUserModal.module.css"

const INIT = { nombre: "", correo: "", celular: "", password: "" }

export default function CreateUserModal({ onClose, onSuccess }) {
    const [form, setForm]       = useState(INIT)
    const [error, setError]     = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleChange = (e) => {
        setError("")
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            await api.post("/api/usuarios", {
                nombre: form.nombre,
                email:    form.correo,   // el backend espera "email"
                celular:  form.celular,
                password: form.password,
            })
            setSuccess(true)
            setForm(INIT)
            onSuccess?.()                // notificar al padre si lo necesita
        } catch (err) {
            setError(err.response?.data?.message || "Error al crear el usuario")
        } finally {
            setLoading(false)
        }
    }

    // Cerrar al hacer clic en el overlay
    const handleOverlay = (e) => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div className={styles.overlay} onClick={handleOverlay}>
            <div className={styles.modal}>

                {/* Encabezado */}
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Crear usuario</h2>
                        <p className={styles.subtitle}>El nuevo usuario tendrá rol de asesora</p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                {/* Formulario */}
                <form className={styles.form} onSubmit={handleSubmit}>

                    {success && (
                        <div className={styles.successMsg}>
                            ✓ Usuario creado exitosamente
                        </div>
                    )}

                    <div className={styles.field}>
                        <label className={styles.label}>Nombre completo</label>
                        <input
                            className={styles.input}
                            name="nombre"
                            type="text"
                            placeholder="Ej: María López"
                            value={form.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Correo electrónico</label>
                        <input
                            className={styles.input}
                            name="correo"
                            type="email"
                            placeholder="correo@susuerte.com"
                            value={form.correo}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Celular</label>
                        <input
                            className={styles.input}
                            name="celular"
                            type="tel"
                            placeholder="3001234567"
                            value={form.celular}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Contraseña</label>
                        <input
                            className={styles.input}
                            name="password"
                            type="password"
                            placeholder="Mín. 7 caracteres, mayúscula, número y símbolo"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        <span className={styles.hint}>
                            Debe tener al menos 7 caracteres, una mayúscula, un número y un símbolo.
                        </span>
                    </div>

                    {error && <div className={styles.errorMsg}>{error}</div>}

                    <div className={styles.btnRow}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? "Creando..." : "Crear usuario"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
