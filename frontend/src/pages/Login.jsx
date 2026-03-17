import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import styles from "./Login.module.css"

export default function Login() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { setUser } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            // 1. Iniciar sesión (establece la cookie httpOnly)
            await api.post("/login", { email, password })

            // 2. Obtener datos del usuario y actualizar el contexto global
            //    Esto es necesario para que ProtectedRoute vea al usuario inmediatamente
            const meRes = await api.get("/api/auth/me")
            setUser(meRes.data)

            // 3. Navegar al dashboard
            navigate("/dashboard")

        } catch (err) {

            setError(err.response?.data?.message || "Credenciales incorrectas")

        } finally {
            setLoading(false)
        }

    }

    return (

        <div className={styles.page}>
            <div className={styles.card}>

                <div className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 10.9 12 11.5 12 13h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H9c0-1.66 1.34-3 3-3s3 1.34 3 3c0 .66-.27 1.26-.69 1.69z"/>
                        </svg>
                    </div>
                    <div className={styles.brand}>su<span>suerte</span></div>
                    <div className={styles.subtitle}>Sistema PQR</div>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>

                    <div className={styles.field}>
                        <label className={styles.label}>Correo electrónico</label>
                        <input
                            className={styles.input}
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Contraseña</label>
                        <input
                            className={styles.input}
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className={styles.errorMsg}>{error}</p>}

                    <button className={styles.btnPrimary} disabled={loading}>
                        {loading ? "Ingresando..." : "Ingresar"}
                    </button>

                </form>

                <p className={styles.footer}>Peticiones, Quejas y Reclamos &mdash; SuSuerte &copy; {new Date().getFullYear()}</p>

            </div>
        </div>

    )
}
