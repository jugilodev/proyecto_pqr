/**
 * App — Punto de entrada de la aplicación.
 *
 * Configura:
 *   - AuthProvider: contexto global de autenticación (verifica sesión al cargar)
 *   - BrowserRouter: enrutamiento del lado del cliente
 *   - ProtectedRoute: guarda las rutas que requieren sesión activa
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import EditPQR from './pages/EditPQR'
import PQRForm from './pages/PQRForm'

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<Login />} />
                    <Route path="/nueva-pqr" element={<PQRForm />} />

                    {/* Rutas protegidas: requieren sesión activa */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pqr/:id"
                        element={
                            <ProtectedRoute>
                                <EditPQR />
                            </ProtectedRoute>
                        }
                    />

                    {/* Cualquier otra ruta redirige al inicio */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
