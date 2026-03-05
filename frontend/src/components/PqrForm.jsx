import { useState, useEffect } from "react";
import "../styles/PqrForm.css";

function PqrForm() {

    const [tipos, setTipos] = useState([]);
    const [canales, setCanales] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [descripcionTipo, setDescripcionTipo] = useState("");

    const [radicado, setRadicado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        direccion: "",
        correo: "",
        celular: "",
        id_tipo_peticion: "",
        fecha_evento: "",
        id_municipio: "",
        descripcion: "",
        id_canal: "",
        acepta_terminos: false
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

    useEffect(() => {
        const obtenerMunicipios = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/municipios");
                const data = await response.json();
                setMunicipios(data);
            } catch (error) {
                console.error("Error cargando municipios:", error);
            }
        };
        obtenerMunicipios();
    }, []);

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });

        if (name === "id_tipo_peticion") {
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

        if (new Date(formData.fecha_evento) > new Date()) {
            alert("La fecha del evento no puede ser futura");
            return;
        }

        setEnviando(true);

        try {

            const payload = {
                ...formData,
                id_tipo_peticion: Number(formData.id_tipo_peticion),
                id_canal: Number(formData.id_canal),
                id_municipio: Number(formData.id_municipio)
            };

            const response = await fetch("http://localhost:3000/api/pqrs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error enviando PQR");
            }

            setRadicado(data.radicado);
            setMostrarModal(true);

            setFormData({
                nombre: "",
                apellido: "",
                direccion: "",
                correo: "",
                celular: "",
                id_tipo_peticion: "",
                fecha_evento: "",
                id_municipio: "",
                descripcion: "",
                id_canal: "",
                acepta_terminos: false
            });

            setDescripcionTipo("");

        } catch (error) {

            console.error(error);
            alert(error.message);

        } finally {

            setEnviando(false);

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
                        <label>Dirección</label>
                        <input
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="pqr-group">
                        <label>Correo electrónico</label>
                        <input
                            name="correo"
                            type="email"
                            value={formData.correo}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="pqr-group">
                        <label>Celular</label>
                        <input
                            name="celular"
                            type="tel"
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
                            name="id_tipo_peticion"
                            value={formData.id_tipo_peticion}
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

                    <div className="pqr-group">
                        <label>Municipio</label>

                        <select
                            name="id_municipio"
                            value={formData.id_municipio}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione una opción</option>

                            {municipios.map((municipio) => (
                                <option key={municipio.id_municipio} value={municipio.id_municipio}>
                                    {municipio.nombre}
                                </option>
                            ))}

                        </select>
                    </div>

                    <div className="pqr-group">
                        <label>Fecha del evento</label>
                        <input
                            name="fecha_evento"
                            type="date"
                            value={formData.fecha_evento}
                            onChange={handleChange}
                            required
                        />
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

                    <div className="pqr-legal">

                        <p>
                            Autorizo el tratamiento de mis datos personales conforme a la ley 1581 de 2012.
                        </p>

                        <label className="pqr-checkbox">
                            <input
                                type="checkbox"
                                name="acepta_terminos"
                                checked={formData.acepta_terminos}
                                onChange={handleChange}
                                required
                            />
                            Autorizo el tratamiento de mis datos personales
                        </label>

                    </div>

                    <button className="pqr-button" disabled={enviando}>
                        {enviando ? "Enviando..." : "Enviar solicitud"}
                    </button>

                </form>

                {mostrarModal && (
                    <div className="modal-overlay">

                        <div className="modal">

                            <h2>Solicitud enviada correctamente</h2>

                            <p>Su número de radicado es:</p>

                            <h1>{radicado}</h1>

                            <button onClick={() => navigator.clipboard.writeText(radicado)}>
                                Copiar radicado
                            </button>

                            <button onClick={() => {
                                setMostrarModal(false);
                                window.scrollTo(0, 0);
                            }}>
                                Cerrar
                            </button>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}

export default PqrForm;