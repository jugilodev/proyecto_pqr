import { useState, useEffect } from "react";
import "../styles/PqrForm.css";

function PqrForm() {

    const [tipos, setTipos] = useState([]);
    const [canales, setCanales] = useState([]);

    const [descripcionTipo, setDescripcionTipo] = useState("");

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        correo: "",
        celular: "",
        tipo_requerimiento_id: "",
        descripcion: "",
        id_canal: ""
    });

    useEffect(() => {

        const obtenerTipos = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/tipo-peticion");
                const data = await response.json();
                setTipos(data);
            } catch (error) {
                console.error("Error cargando tipos:", error);
            }
        };

        obtenerTipos();

    }, []);

    useEffect(() => {
        const obtenerCanales = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/canales");
                const data = await response.json();
                setCanales(data);
            } catch (error) {
                console.error("Error cargando canales:", error);
            }
        };

        obtenerCanales();

    }, []);


    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        // Si cambia el tipo de requerimiento
        if (name === "tipo_requerimiento_id") {

            const tipoSeleccionado = tipos.find(
                (tipo) => tipo.id_tipo_peticion == value
            );

            if (tipoSeleccionado) {
                setDescripcionTipo(tipoSeleccionado.descripcion);
            } else {
                setDescripcionTipo("");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const response = await fetch("http://localhost:3000/api/pqrs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error("Error enviando PQR");
            }

            alert("PQR enviada correctamente");

            setFormData({
                nombre: "",
                apellido: "",
                correo: "",
                celular: "",
                tipo_requerimiento_id: "",
                descripcion: "",
                id_canal: ""
            });

            setDescripcionTipo("");

        } catch (error) {
            console.error(error);
            alert("Error enviando la PQR");
        }
    };

    return (
        <div className="pqr-container">

            <div className="pqr-card">

                <h2 className="pqr-title">Formulario de PQR</h2>

                <form className="pqr-form" onSubmit={handleSubmit}>

                    <div className="pqr-group">
                        <label>Nombre</label>
                        <input
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="pqr-group">
                        <label>Apellido</label>
                        <input
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="pqr-group">
                        <label>Correo electrónico</label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="pqr-group">
                        <label>Celular</label>
                        <input
                            type="tel"
                            name="celular"
                            value={formData.celular}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="pqr-group">

                        <label className="label-tooltip">
                            Tipo de requerimiento

                            <span className="tooltip-icon">
                                ?
                                <span className="tooltip-text">
                                    {descripcionTipo || "Seleccione un tipo para ver su descripción"}
                                </span>
                            </span>

                        </label>

                        <select
                            name="tipo_requerimiento_id"
                            value={formData.tipo_requerimiento_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione una opción</option>

                            {tipos.map((tipo) => (
                                <option key={tipo.id_tipo_peticion} value={tipo.id_tipo_peticion}>
                                    {tipo.tipo_peticion}
                                </option>
                            ))}

                        </select>
                    </div>

                    <div className="pqr-group">
                        <label>Descripción</label>
                        <textarea
                            name="descripcion"
                            rows="4"
                            value={formData.descripcion}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="pqr-group">
                        <label>Canal</label>

                        <select
                            name="id_canal"
                            value={formData.id_canal}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione una opción</option>

                            {canales.map((canal) => (
                                <option key={canal.id_canal} value={canal.id_canal}>
                                    {canal.tipo_canal}
                                </option>
                            ))}

                        </select>
                    </div>

                    <button className="pqr-button">
                        Enviar solicitud
                    </button>

                </form>

            </div>

        </div>
    );
}

export default PqrForm;