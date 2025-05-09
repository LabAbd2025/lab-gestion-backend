const express = require("express");
const router = express.Router();
const valoracionController = require('../controllers/valoraciones.controller');

// Ruta para crear múltiples valoraciones
router.post('/crear', valoracionController.crearValoraciones);
router.get('/producto/:id', valoracionController.getValoracionesPorProducto);
router.post('/asignar', valoracionController.asignarValoracionesAProducto);
router.put('/actualizar/:id', valoracionController.actualizarValoracion);
router.delete('/eliminar/:id', valoracionController.eliminarValoracion);
router.get('/productos-con-valoraciones', valoracionController.getProductosConValoraciones);
router.get('/buscar', valoracionController.buscarValoraciones);
router.get('/', valoracionController.getTodasLasValoraciones);



module.exports = app => {
    app.use("/valoraciones", router);
}