const express = require("express");
const router = express.Router();
const controller = require("../controllers/producto.controller");


// Obtener todos los productos
router.get("/obtener", controller.obtenerProductos);

// Buscar productos por nombre/lote/envase/volumen
router.get("/buscar", controller.buscarProductos);

// Editar producto por ID
router.put("/editar/:id", controller.editarProducto);

// Eliminar producto por ID
router.delete("/eliminar/:id", controller.eliminarProducto);

//Agregar producto manualmente desde frontend
router.post("/agregar", controller.agregarProducto);

//Formula cuantitativa
router.get("/detalle-formula/:nombre", controller.obtenerDetalleProducto);

// Obtener productos por clasificación (ESTABLE o MENOS ESTABLE)
router.get("/por-clasificacion/:tipo", controller.obtenerProductosPorClasificacion);



module.exports = app => {
  app.use("/productos", router);
};
