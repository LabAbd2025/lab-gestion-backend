const express = require("express");
const router = express.Router();
const controller = require("../controllers/protocolo.controller");

router.get("/generar-codigo", controller.generarCodigoProtocolo);
router.post("/crear", controller.crearProtocolo);


module.exports = app => {
    app.use("/protocolo", router);
  };
  
