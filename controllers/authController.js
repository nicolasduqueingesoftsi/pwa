const axios = require("axios");

const AUTH_API_URL = "https://pruebasappolomovil.ingesoftsi.com/oauth/v2/token";
const CLIENT_ID = process.env.CLIENT_ID || "3bcbxd9e24g0gk4swg0kwgcwg4o8k8g4g888kwc44gcc0gwwk4";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "4ok2x70rlfokc8g0wws8c8kwcokw80k44sg48goc0ok4w0so0k";

/**
 * 📌 Iniciar sesión con la API externa
 */
const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "❌ Usuario y contraseña son obligatorios." });
    }

    try {
        const response = await axios.post(AUTH_API_URL, {
            username,
            password,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "password"
        });

        res.json({
            message: "✅ Inicio de sesión exitoso.",
            token: response.data.access_token,
            token_type: response.data.token_type,
            refresh_token: response.data.refresh_token,
            expires_in: response.data.expires_in
        });

    } catch (error) {
        console.error("❌ Error en autenticación:", error.response?.data || error);
        
        const errorMessage = error.response?.data?.error_description || "Usuario o contraseña incorrectos.";
        res.status(401).json({ error: errorMessage });
    }
};

/**
 * 📌 Renovar Token OAuth2
 */
const refreshToken = async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ error: "❌ Se requiere un refresh_token." });
    }

    try {
        const response = await axios.post(AUTH_API_URL, {
            refresh_token,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "refresh_token"
        });

        console.log("🔄 Token renovado exitosamente:", response.data);

        res.json({
            message: "✅ Token renovado exitosamente.",
            token: response.data.access_token,
            token_type: response.data.token_type,
            refresh_token: response.data.refresh_token,
            expires_in: response.data.expires_in
        });

    } catch (error) {
        console.error("❌ Error renovando token OAuth2:", error.response?.data || error);

        const errorMessage = error.response?.data?.error_description || "No se pudo renovar el token.";
        res.status(401).json({ error: errorMessage });
    }
};

/**
 * 📌 Verificación del Token (opcional, si la API lo permite)
 */
const verifyToken = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "❌ No se proporcionó un token válido." });
    }

    try {
        res.json({ message: "✅ Token válido.", token });
    } catch (error) {
        console.error("❌ Token inválido:", error);
        res.status(401).json({ error: "❌ Token no válido o expirado." });
    }
};

/**
 * 📌 Cierre de sesión (opcional, solo borra el token en el frontend)
 */
const logout = (req, res) => {
    res.json({ message: "✅ Sesión cerrada exitosamente." });
};

// 📌 Exportar funciones correctamente
module.exports = { login, refreshToken, verifyToken, logout };
