const express = require("express");
const router = express.Router();
const controller = require("../controllers/formula.controller");

router.get("/producto/:nombre", controller.obtenerFormulasPorProducto);
router.post("/crear", controller.crearFormula);
router.post("/importar-excel", controller.importarDesdeExcel);
router.get("/todas", controller.obtenerTodasLasFormulas);
router.delete("/eliminar/:id", controller.eliminarFormula);
router.put("/editar/:id", controller.editarFormula);
module.exports = app => {
  app.use("/formulas", router);
};
