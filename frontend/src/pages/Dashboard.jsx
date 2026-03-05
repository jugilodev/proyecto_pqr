import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";

function Dashboard() {
    const [pqrs, setPqrs] = useState([]);

    useEffect(() => {

        const cargarPqrs = async () => {

            const response = await fetch("http://localhost:3000/api/pqrs", {
                credentials: "include"
            });

            const data = await response.json();

            setPqrs(data);
        };

        cargarPqrs();

    }, []);

    return (
        <div>

            <Navbar />

            <h1>Listado de PQR</h1>
            <table border="1">

                <thead>
                    <tr>
                        <th>Radicado</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Cliente</th>
                    </tr>
                </thead>

                <tbody>

                    {pqrs.map((pqr) => (
                        <tr key={pqr.id_pqr}>

                            <td>{pqr.radicado}</td>
                            <td>{pqr.tipo_peticion}</td>
                            <td>{pqr.tipo_estado}</td>
                            <td>{pqr.nombre} {pqr.apellido}</td>

                        </tr>
                    ))}

                </tbody>

            </table>

        </div>
    );
}

export default Dashboard;