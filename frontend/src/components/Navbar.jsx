import { useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const logout = async () => {

        await fetch("http://localhost:3000/api/auth/logout", {
            method: "POST",
            credentials: "include"
        });

        navigate("/");
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px",
            background: "#eee"
        }}>

            <h3>Sistema PQR</h3>

            <button onClick={logout}>
                Cerrar sesión
            </button>

        </div>
    );
}

export default Navbar;