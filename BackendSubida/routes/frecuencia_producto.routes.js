const express = require("express");
const router = express.Router();
const controller = require("../controllers/frecuencia_producto.controller");

// 🔹 Obtener frecuencias por producto y tipo
router.get("/producto/:productoId/tipo/:tipo_estudio", controller.obtenerPorProductoYTipo);

// 🔹 Crear nueva frecuencia
router.post("/", controller.crear);

router.get("/", controller.obtenerFrecuencias);

// 🔹 Editar frecuencia por ID
router.put("/:id", controller.editar);

// 🔹 Eliminar frecuencia por ID
router.delete("/:id", controller.eliminar);

module.exports = (app) => {
  app.use("/frecuencia-producto", router);
};
