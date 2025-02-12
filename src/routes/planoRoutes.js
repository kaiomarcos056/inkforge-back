const express = require("express");
const router = express.Router();
const planoController = require("../controllers/planoController");

router.post("/", planoController.createPlano);

router.get("/", planoController.getAllPlanos);

module.exports = router;
