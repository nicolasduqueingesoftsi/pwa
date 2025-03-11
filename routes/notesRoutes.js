const express = require("express");
const router = express.Router();
const { getNotes, addNote } = require("../controllers/notesController");

router.get("/", getNotes);
router.post("/", addNote);

module.exports = router;
