const express = require("express");
const router = express.Router();
const { sendCheckListTow } = require("../controllers/checklistController"); // 🔹 Asegúrate de que el nombre sea correcto

// 📌 Definir rutas correctamente
router.post("/sendCheckListTow", sendCheckListTow);

module.exports = router; // 🔹 Exportar el router correctamente
