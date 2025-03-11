const axios = require("axios");

// 📌 URL del servicio externo
const API_URL = "https://pruebasappolomovil.ingesoftsi.com/api/tow/sendCheckListTow.json";

/**
 * 📌 Función para enviar el checklist a la API externa
 */
const sendCheckListTow = async (req, res) => {
    try {
        // 📌 Recuperar el token de autenticación desde los headers o el cuerpo
        const token = req.headers.authorization?.split(" ")[1] || req.body.token;

        if (!token) {
            return res.status(401).json({ success: false, message: "❌ No hay token de autenticación. Inicia sesión." });
        }

        console.log("📤 Enviando datos a la API externa:", req.body);

        // 📌 Validación de datos antes de enviarlos
        const requiredFields = ["luces", "frenos", "motor"];
        for (const field of requiredFields) {
            if (req.body[field] === undefined) {
                return res.status(400).json({ success: false, message: `❌ El campo '${field}' es obligatorio.` });
            }
        }

        // 📌 Enviar solicitud a la API externa con el token en la cabecera
        const response = await axios.post(API_URL, req.body, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        console.log("📋 Respuesta de la API:", response.data);

        if (response.data.success) {
            res.json({ success: true, message: "✅ Checklist enviado correctamente." });
        } else {
            res.status(400).json({ success: false, message: "❌ Error en la respuesta de la API externa.", api_response: response.data });
        }

    } catch (error) {
        console.error("❌ Error en la API externa:", error.response?.data || error.message);

        // 📌 Manejo específico de errores de autenticación y otros códigos HTTP
        if (error.response) {
            const { status, data } = error.response;

            const errorMessages = {
                400: "❌ Datos inválidos en la solicitud.",
                401: "❌ Token inválido o expirado. Inicia sesión nuevamente.",
                403: "❌ Acceso denegado.",
                404: "❌ Endpoint no encontrado en la API externa.",
                500: "❌ Error interno en la API externa."
            };

            return res.status(status).json({
                success: false,
                message: errorMessages[status] || "❌ Error desconocido.",
                error: data || error.message
            });
        }

        res.status(500).json({
            success: false,
            message: "❌ Error en el servidor.",
            error: error.message
        });
    }
};

module.exports = { sendCheckListTow };
