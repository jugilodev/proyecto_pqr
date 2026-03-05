import { useState, useEffect } from "react";
import "../styles/PqrForm.css";

function PqrForm() {

    const [tipos, setTipos] = useState([]);
    const [canales, setCanales] = useState([]);
    const [descripcionTipo, setDescripcionTipo] = useState("");
    const [municipios, setMunicipios] = useState([]);
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

        // Si cambia el tipo de requerimiento
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
                        <label>Dirección</label>
                        <input
                            name="direccion"
                            value={formData.direccion}
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

                    <div className="pqr-vendedor">

                        <h3>Información del vendedor (Opcional)</h3>

                        <div className="pqr-group">
                            <label>Cédula del vendedor</label>
                            <input
                                name="vendedor_cédula"
                                value={formData.vendedor_cédula || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="pqr-group">
                            <label>Nombre del vendedor</label>
                            <input
                                name="vendedor_nombre"
                                value={formData.vendedor_nombre || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="pqr-group">
                            <label>Celular del vendedor</label>
                            <input
                                name="vendedor_celular"
                                value={formData.vendedor_celular || ""}
                                onChange={handleChange}
                            />
                        </div>

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
                            De acuerdo con la ley 1581 de 2012, sus normas concordantes y reglamentarias, declaro que soy mayor de edad y soy consciente que debo presentar evidencia o soporte en caso de ser requerido para realizar este trámite. En forma previa, libre, voluntaria, informada, expresa, y debidamente prevenido(a) sobre mis derechos como titular, autorizo a SUSUERTE S.A para recolectar, almacenar, dar tratamiento, actualizar, disponer, transmitir y transferir, mis datos personales, mi imagen y documentos adjuntos propios y de terceros, de los cuales tengo autorización; que se incorporarán en sus bases de datos, para gestionar y tramitar PQRSF (durante y después); contactarme para realizar encuestas, calificación y consultas; ofrecerme servicios en general; remitir información comercial y de marketing; y para todos los fines legales pertinentes. Sé que cuando me pregunten por datos sensibles o de menores de edad, tengo la facultad de dar o no respuesta. Tengo derecho a conocer, actualizar, rectificar y suprimir mis datos, a la cuenta de correo electrónico servicioalcliente@susuerte.com, o la dirección Carrera 23C No. 64 – 32 Manizales – Caldas, también conozco que puedo consultar el Manual de Políticas de Tratamiento de Datos Personales en la página web www.susuerte.com
                        </p>

                        <label className="pqr-checkbox">
                            <input
                                type="checkbox"
                                name="autorizacion_datos"
                                checked={formData.autorizacion_datos}
                                onChange={handleChange}
                                required
                            />
                            Autorizo el tratamiento de mis datos personales
                        </label>

                    </div>

                    <button className="pqr-button">
                        Enviar solicitud
                    </button>

                </form>

            </div >

        </div >
    );
}

export default PqrForm;