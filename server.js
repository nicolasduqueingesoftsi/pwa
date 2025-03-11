const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const checklistRoutes = require("./routes/checklistRoutes");
const notesRoutes = require("./routes/notesRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 📌 Servir archivos estáticos desde `public/assets`
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// 📌 Servir `favicon.ico`
app.use("/logo_apolo.ico", express.static(path.join(__dirname, "public/assets/images/logo_apolo.ico")));

// 📌 Servir `index.html`
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views/index.html"));
});

// 📌 Servir `checklist.html`
app.get("/checklist", (req, res) => {
    res.sendFile(path.join(__dirname, "views/checklist.html"));
});

// 📌 Usar las rutas de autenticación y checklist
app.use("/api/auth", authRoutes);
app.use("/api/tow", checklistRoutes);
app.use("/api/notes", notesRoutes);

// 📌 Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: "❌ Ruta no encontrada" });
});

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
