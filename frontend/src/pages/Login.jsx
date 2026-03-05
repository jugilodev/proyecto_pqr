import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                correo,
                password
            })
        });

        if (response.ok) {
            navigate("/dashboard");
        } else {
            alert("Login incorrecto");
        }
    };

    return (
        <div>

            <h2>Login</h2>

            <form onSubmit={handleLogin}>

                <input
                    placeholder="Correo"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <br /><br />

                <button type="submit">
                    Iniciar sesión
                </button>

            </form>

        </div>
    );
}

export default Login;