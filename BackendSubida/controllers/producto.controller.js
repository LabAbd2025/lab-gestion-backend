const {
  productos: Producto,
  forma_farmaceutica: FormaFarmaceutica,
  formula_cuali_cuantitativa: Formula,
  materias_primas: MateriaPrima,
  clasificacion_pa: ClasificacionPA,
  valoraciones: Valoracion,
  volumenes_producto: VolumenProducto,
} = require('../models');

const { Op, Sequelize } = require("sequelize");


exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: [
        {
          model: FormaFarmaceutica,
          as: "formaFarmaceutica",
          attributes: ["nombre"]
        },
        {
          model: VolumenProducto,
          as: "volumenes",
          attributes: ["cantidad", "unidad", "observacion"]
        }
      ]
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
    const {
      nombre,
      lote,
      envase,
      hermeticidad,
      aspecto,
      phMin,
      phMax,
      conductividad,
      impurezas,
      particulas,
      recuentoMicrobianoMin,
      recuentoMicrobianoMax,
      esterilidad,
      endotoxinas,
      observaciones,
      referenciaDocumental,
      fechaAnalisis,
      volumenes = []
    } = req.body;

    const [updated] = await Producto.update({
      nombre,
      lote,
      envase,
      hermeticidad,
      aspecto,
      phMin,
      phMax,
      conductividad,
      impurezas,
      particulas,
      recuentoMicrobianoMin,
      recuentoMicrobianoMax,
      esterilidad,
      endotoxinas,
      observaciones,
      referenciaDocumental,
      fechaAnalisis
    }, {
      where: { id }
    });

    if (!updated) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    // 🔄 Reemplazar volúmenes existentes
    await VolumenProducto.destroy({ where: { productoId: id } });

    const nuevosVolumenes = volumenes.map(vol => ({
      cantidad: vol.cantidad,
      unidad: vol.unidad,
      observacion: vol.observacion || `No menor a ${vol.cantidad} ${vol.unidad}`,
      productoId: id
    }));

    if (nuevosVolumenes.length > 0) {
      await VolumenProducto.bulkCreate(nuevosVolumenes);
    }

    const productoActualizado = await Producto.findByPk(id);
    res.status(200).json({ msg: "Producto actualizado con volúmenes", producto: productoActualizado });
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


// Buscar productos
exports.buscarProductos = async (req, res) => {
  try {
    if (!req.query.q) return res.status(400).json({ msg: "Debes enviar un parámetro de búsqueda (?q=)" });

    let query = req.query.q;
    try {
      query = decodeURIComponent(query).toLowerCase();
    } catch {
      query = query.toLowerCase(); // fallback seguro si viene mal
    }

    const productos = await Producto.findAll({
      where: {
        [Op.or]: [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('productos.nombre')), {
            [Op.like]: `%${query}%`
          }),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('productos.nombre')), {
            [Op.eq]: query
          }),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('productos.lote')), {
            [Op.like]: `%${query}%`
          }),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('productos.envase')), {
            [Op.like]: `%${query}%`
          })
        ]
      },
      include: [
        {
          model: FormaFarmaceutica,
          as: "formaFarmaceutica",
          attributes: ["nombre"]
        },
        {
          model: VolumenProducto,
          as: "volumenes",
          attributes: ["cantidad", "unidad", "observacion"]
        }
      ]
    });

    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al buscar productos:", error);
    res.status(500).json({ msg: "Error al buscar productos", error });
  }
};

// Crear un nuevo producto
exports.agregarProducto = async (req, res) => {
  try {
    const {
      nombre, lote, envase,
      hermeticidad, aspecto, phMin, phMax, conductividad,
      impurezas, particulas, recuentoMicrobianoMin, recuentoMicrobianoMax,
      esterilidad, endotoxinas, observaciones, referenciaDocumental, fechaAnalisis,
      formaFarmaceuticaNombre,
      volumenes = []
    } = req.body;

    if (!nombre || !formaFarmaceuticaNombre) {
      return res.status(400).json({ msg: "Nombre del producto y forma farmacéutica son obligatorios" });
    }

    const [formaFarmaceutica] = await FormaFarmaceutica.findOrCreate({
      where: { nombre: formaFarmaceuticaNombre },
      defaults: { nombre: formaFarmaceuticaNombre }
    });

    const nuevoProducto = await Producto.create({
      nombre,
      lote,
      envase,
      hermeticidad,
      aspecto,
      phMin,
      phMax,
      conductividad,
      impurezas,
      particulas,
      recuentoMicrobianoMin,
      recuentoMicrobianoMax,
      esterilidad,
      endotoxinas,
      observaciones,
      referenciaDocumental,
      fechaAnalisis,
      formaFarmaceuticaId: formaFarmaceutica.id,
      otros_datos: {}
    });

    const volumenesFormateados = volumenes.map(vol => ({
      cantidad: vol.cantidad,
      unidad: vol.unidad,
      observacion: vol.observacion || `No menor a ${vol.cantidad} ${vol.unidad}`,
      productoId: nuevoProducto.id
    }));

    if (volumenesFormateados.length > 0) {
      await VolumenProducto.bulkCreate(volumenesFormateados);
    }

    res.status(201).json({ msg: "Producto creado correctamente", producto: nuevoProducto });
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
        },
        {
          model: require('../models').volumenes_producto,
          as: "volumenes",
          attributes: ["cantidad", "unidad", "observacion"]
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
    if (producto.phMin !== null && producto.phMax !== null) especificaciones.push({ tipo: "especificacion", nombre: "pH", criterio: `${producto.phMin} - ${producto.phMax}` });
    if (producto.hermeticidad) especificaciones.push({ tipo: "especificacion", nombre: "Hermeticidad", criterio: producto.hermeticidad });
    if (producto.conductividad) especificaciones.push({ tipo: "especificacion", nombre: "Conductividad", criterio: producto.conductividad });
    if (producto.impurezas) especificaciones.push({ tipo: "especificacion", nombre: "Impurezas", criterio: producto.impurezas });
    if (producto.esterilidad) especificaciones.push({ tipo: "prueba_microbiologica", nombre: "Esterilidad", criterio: producto.esterilidad });
    if (producto.endotoxinas) especificaciones.push({ tipo: "prueba_microbiologica", nombre: "Endotoxinas", criterio: producto.endotoxinas });

    // Agregar observaciones adicionales si las hay
    if (producto.otros_datos) {
      const otros = typeof producto.otros_datos === "string" ? JSON.parse(producto.otros_datos) : producto.otros_datos;
      for (const [clave, valor] of Object.entries(otros || {})) {
        especificaciones.push({ tipo: "valoracion", nombre: clave, criterio: valor });
      }
    }

    const valoraciones = (producto.valoraciones || []).map(v => ({
      tipo: "valoracion",
      nombre: v.nombre,
      criterio: v.rango
    }));

    res.json({
      nombre: producto.nombre,
      formaFarmaceutica: producto.formaFarmaceutica?.nombre,
      envasePrimario: producto.envase,
      volumenes: producto.volumenes, // ✅ ahora array completo
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
