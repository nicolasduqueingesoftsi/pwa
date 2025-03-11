const { Pool } = require("pg");

// 📌 Conexión a PostgreSQL
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "pwa_login",
    password: "tu_contraseña",
    port: 5432
});

// 📌 Buscar usuario por DNI
const findUserByDNI = async (dni) => {
    const result = await pool.query("SELECT * FROM users WHERE dni = $1", [dni]);
    return result.rows[0];
};

module.exports = { findUserByDNI };
