const express = require("express");
const router = express.Router();
const {
    createUsuario,
    getUsuarios,
    getUsuarioByUuid,
    getLivrosByUsuario,
    updateUsuario,
    deleteUsuario,
} = require("../controllers/usuarioController");

router.post("/", createUsuario);

router.get("/", getUsuarios);
router.get("/:uuid", getUsuarioByUuid);
router.get("/livros/:usuarioUuid", getLivrosByUsuario);

router.put("/:uuid", updateUsuario);

router.delete("/:uuid", deleteUsuario);

module.exports = router;
