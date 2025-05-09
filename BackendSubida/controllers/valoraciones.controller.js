const db = require("../models");
const Valoracion = db.valoraciones;
const Producto = db.productos;
const { Op } = require("sequelize");

// Crear una o varias valoraciones
exports.crearValoraciones = async (req, res) => {
  let valoraciones = req.body.valoraciones || req.body;

  if (!Array.isArray(valoraciones)) {
    valoraciones = [valoraciones];
  }

  if (valoraciones.length === 0) {
    return res.status(400).json({ msg: "Debes enviar al menos una valoración." });
  }

  try {
    // Validación básica para asegurar que venga un rango bien armado
    const valoracionesFormateadas = valoraciones.map(v => {
      if (!v.nombre || !v.rango) {
        throw new Error("Faltan campos requeridos en alguna valoración.");
      }

      return {
        nombre: v.nombre,
        rango: v.rango  // no modificar el string armado desde el frontend
      };
    });

    const nuevas = await Valoracion.bulkCreate(valoracionesFormateadas);
    res.status(201).json(nuevas);
  } catch (error) {
    console.error("Error al crear valoraciones:", error);
    res.status(500).json({ msg: "Error al crear valoraciones." });
  }
};


// Obtener todas las valoraciones
exports.getTodasLasValoraciones = async (req, res) => {
  try {
    const valoraciones = await Valoracion.findAll();
    res.json(valoraciones);
  } catch (error) {
    console.error("Error al obtener todas las valoraciones:", error);
    res.status(500).json({ msg: "Error al obtener las valoraciones." });
  }
};

// Obtener valoraciones asociadas a un producto
exports.getValoracionesPorProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const producto = await Producto.findByPk(id, {
      include: {
        model: Valoracion,
        as: "valoraciones",
        attributes: ["id", "nombre", "rango"],
        through: { attributes: [] } // no mostrar datos de la tabla intermedia
      }
    });

    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado." });
    }

    res.json(producto.valoraciones);
  } catch (error) {
    console.error("Error al obtener valoraciones por producto:", error);
    res.status(500).json({ msg: "Error al obtener valoraciones." });
  }
};

// Asignar valoraciones existentes a un producto
exports.asignarValoracionesAProducto = async (req, res) => {
  const { productoId, valoracionIds } = req.body;

  if (!productoId || !Array.isArray(valoracionIds)) {
    return res.status(400).json({ msg: "Faltan datos necesarios." });
  }

  try {
    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado." });
    }

    await producto.setValoraciones(valoracionIds); // reemplaza todas
    res.json({ msg: "Valoraciones asignadas correctamente al producto." });
  } catch (error) {
    console.error("Error al asignar valoraciones:", error);
    res.status(500).json({ msg: "Error al asignar valoraciones." });
  }
};

// Editar una valoración
exports.actualizarValoracion = async (req, res) => {
  const { id } = req.params;
  try {
    const [updated] = await Valoracion.update(req.body, { where: { id } });
    if (updated) {
      const valoracionActualizada = await Valoracion.findByPk(id);
      res.json(valoracionActualizada);
    } else {
      res.status(404).json({ msg: "Valoración no encontrada." });
    }
  } catch (error) {
    console.error("Error al actualizar valoración:", error);
    res.status(500).json({ msg: "Error al actualizar valoración." });
  }
};

// Eliminar una valoración
exports.eliminarValoracion = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Valoracion.destroy({ where: { id } });
    if (deleted) {
      res.json({ msg: "Valoración eliminada correctamente." });
    } else {
      res.status(404).json({ msg: "Valoración no encontrada." });
    }
  } catch (error) {
    console.error("Error al eliminar valoración:", error);
    res.status(500).json({ msg: "Error al eliminar valoración." });
  }
};

// Obtener todos los productos con sus valoraciones asociadas
exports.getProductosConValoraciones = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: {
        model: Valoracion,
        as: "valoraciones",
        attributes: ["id", "nombre", "rango"],
        through: { attributes: [] }
      },
      attributes: ["id", "nombre"]
    });
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos con valoraciones:", error);
    res.status(500).json({ msg: "Error al obtener productos con valoraciones." });
  }
};

//Buscar valoraciones por nombre
exports.buscarValoraciones = async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ msg: "Debe enviar un parámetro de búsqueda (?q=)" });
  }

  try {
    const valoraciones = await Valoracion.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${query}%` } },
          { rango: { [Op.iLike]: `%${query}%` } }
        ]
      },
      attributes: ["id", "nombre", "rango"]
    });

    res.json(valoraciones);
  } catch (error) {
    console.error("Error al buscar valoraciones:", error);
    res.status(500).json({ msg: "Error al buscar valoraciones." });
  }
};