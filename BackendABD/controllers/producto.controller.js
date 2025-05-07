const { productos: Producto, forma_farmaceutica: FormaFarmaceutica, formula_cuali_cuantitativa: Formula, materias_primas: MateriaPrima, clasificacion_pa: ClasificacionPA, valoraciones: Valoracion} = require('../models');
const { Op, Sequelize } = require("sequelize");

const normalizarTexto = (texto) => {
  return texto?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
};

exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: [{ model: FormaFarmaceutica, as: "formaFarmaceutica", attributes: ["nombre"] }]
    });
    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ msg: "Error al obtener productos", error: error.message });
  }
};

exports.obtenerProductosPorClasificacion = async (req, res) => {
  const tipo = req.params.tipo; // "ESTABLE" o "MENOS ESTABLE"

  try {
    // Obtener los nombres de productos que tienen la clasificación solicitada
    const clasificados = await ClasificacionPA.findAll({
      where: { clasificacion: tipo },
      attributes: ['productoNombre']
    });

    const nombresProductos = clasificados.map(c => c.productoNombre);

    const productos = await Producto.findAll({
      where: {
        nombre: { [Op.in]: nombresProductos }
      }
    });

    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos por clasificación:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

exports.editarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Producto.update(req.body, { where: { id } });
    if (updated) {
      const productoActualizado = await Producto.findByPk(id);
      res.status(200).json({ msg: "Producto actualizado", producto: productoActualizado });
    } else {
      res.status(404).json({ msg: "Producto no encontrado" });
    }
  } catch (error) {
    console.error("Error al editar producto:", error);
    res.status(500).json({ msg: "Error al editar producto", error });
  }
};

exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Producto.destroy({ where: { id } });
    if (eliminado) {
      res.status(200).json({ msg: "Producto eliminado correctamente" });
    } else {
      res.status(404).json({ msg: "Producto no encontrado" });
    }
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ msg: "Error al eliminar producto", error });
  }
};

exports.buscarProductos = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ msg: "Debes enviar un parámetro de búsqueda (?q=)" });

    const productos = await Producto.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${query}%` } },
          { lote: { [Op.like]: `%${query}%` } },
          { envase: { [Op.like]: `%${query}%` } },
          { volumenCantidad: { [Op.like]: `%${query}%` } }
        ]
      }
    });

    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al buscar productos:", error);
    res.status(500).json({ msg: "Error al buscar productos", error });
  }
};

exports.agregarProducto = async (req, res) => {
  try {
    const {
      nombre, lote, envase, volumenCantidad, volumenUnidad,
      hermeticidad, aspecto, ph_min, ph_max, conductividad,
      impurezas, particulas, recuentoMicrobiano_min, recuentoMicrobiano_max,
      esterilidad, endotoxinas, observaciones, fechaAnalisis,
      formaFarmaceuticaNombre
    } = req.body;

    if (!nombre || !formaFarmaceuticaNombre) {
      return res.status(400).json({ msg: "Nombre del producto y forma farmacéutica son obligatorios" });
    }

    const [formaFarmaceutica] = await FormaFarmaceutica.findOrCreate({
      where: { nombre: formaFarmaceuticaNombre },
      defaults: { nombre: formaFarmaceuticaNombre }
    });

    const nuevo = await Producto.create({
      nombre,
      lote,
      envase,
      volumenCantidad,
      volumenUnidad,
      hermeticidad,
      aspecto,
      ph_min,
      ph_max,
      conductividad,
      impurezas,
      particulas,
      recuentoMicrobiano_min,
      recuentoMicrobiano_max,
      esterilidad,
      endotoxinas,
      observaciones,
      fechaAnalisis,
      formaFarmaceuticaId: formaFarmaceutica.id,
      otros_datos: {}
    });

    res.status(201).json({ msg: "Producto creado correctamente", producto: nuevo });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ msg: "Error al crear producto", error: error.message });
  }
};

// Obtener detalle del producto
exports.obtenerDetalleProducto = async (req, res) => {
  try {
    const nombre = req.params.nombre.toLowerCase();

    const producto = await Producto.findOne({
      where: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('productos.nombre')),
        nombre
      ),
      include: [
        {
          model: FormaFarmaceutica,
          as: "formaFarmaceutica",
          attributes: ["nombre"]
        },
        {
          model: Valoracion,
          as: "valoraciones",
          attributes: ["nombre", "rango"]
        }
      ]
    });

    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

    const formulas = await Formula.findAll({
      where: { productoNombre: { [Op.like]: `%${nombre}%` } },
      include: [{ model: MateriaPrima, as: "materiasPrimas" }]
    });
     
    const especificaciones = [];

    if (producto.aspecto) especificaciones.push({ tipo: "especificacion", nombre: "Aspecto", criterio: producto.aspecto });
    if (producto.ph_min !== null && producto.ph_max !== null) especificaciones.push({ tipo: "especificacion", nombre: "pH", criterio: `${producto.ph_min} - ${producto.ph_max}` });
    if (producto.volumenCantidad && producto.volumenUnidad) especificaciones.push({ tipo: "especificacion", nombre: "Volumen", criterio: `No menor a ${producto.volumenCantidad} ${producto.volumenUnidad}` });
    if (producto.hermeticidad) especificaciones.push({ tipo: "especificacion", nombre: "Hermeticidad", criterio: producto.hermeticidad });
    if (producto.conductividad) especificaciones.push({ tipo: "especificacion", nombre: "Conductividad", criterio: producto.conductividad });
    if (producto.impurezas) especificaciones.push({ tipo: "especificacion", nombre: "Impurezas", criterio: producto.impurezas });
    if (producto.esterilidad) especificaciones.push({ tipo: "prueba_microbiologica", nombre: "Esterilidad", criterio: producto.esterilidad });
    if (producto.endotoxinas) especificaciones.push({ tipo: "prueba_microbiologica", nombre: "Endotoxinas", criterio: producto.endotoxinas });

    if (producto.otros_datos) {
      const otros = typeof producto.otros_datos === "string" ? JSON.parse(producto.otros_datos) : producto.otros_datos;
      for (const [clave, valor] of Object.entries(otros || {})) {
        especificaciones.push({ tipo: "valoracion", nombre: clave, criterio: valor });
      }
    }

    // También agregamos las valoraciones explícitas
    const valoraciones = (producto.valoraciones || []).map(v => ({
      tipo: "valoracion",
      nombre: v.nombre,
      criterio: v.rango
    }));

    res.json({
      nombre: producto.nombre,
      formaFarmaceutica: producto.formaFarmaceutica?.nombre,
      envasePrimario: producto.envase,
      volumenes: formulas.map(f => f.volumenNominal),
      volumenCantidad: producto.volumenCantidad, 
      volumenUnidad: producto.volumenUnidad,     
      formulas: formulas.map(f => ({
        volumen: f.volumenNominal,
        materiasPrimas: f.materiasPrimas.map(mp => ({
          materiaPrima: mp.nombre,
          cantidad: mp.cantidad,
          unidad: mp.unidad
        }))
      })),
      especificaciones: [...especificaciones, ...valoraciones]
    });
    

  } catch (error) {
    console.error("Error al obtener detalle del producto:", error);
    res.status(500).json({ error: "Error al procesar detalle del producto" });
  }
};