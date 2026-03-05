import { useNavigate } from "react-router-dom";

function LogoutButton() {

    const navigate = useNavigate();

    const handleLogout = async () => {

        await fetch("http://localhost:3000/api/auth/logout", {
            method: "POST",
            credentials: "include"
        });

        navigate("/");
    };

    return (
        <button onClick={handleLogout}>
            Cerrar sesión
        </button>
    );
}

export default LogoutButton;