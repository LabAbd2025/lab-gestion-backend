const db = require("../models");
const Frecuencia = db.frecuencia_muestreo_producto;


exports.obtenerPorProductoYTipo = async (req, res) => {
  const { productoId } = req.params;

  try {
    const registro = await db.frecuencia_muestreo_producto.findOne({
      where: { productoId },
      attributes: [
        "aspecto",
        "hermeticidad",
        "ph",
        "valoracion",
        "particulas_visibles",
        "pruebas_microbiologicas",
        "rectificacion",
        "frecuencia"
      ],
    });

    if (!registro) {
      return res.status(404).json({ msg: "No hay frecuencia registrada." });
    }

    const respuesta = {
      aspecto: registro.aspecto,
      hermeticidad: registro.hermeticidad,
      ph: registro.ph,
      valoracion: registro.valoracion,
      particulas_visibles: registro.particulas_visibles,
      pruebas_microbiologicas: registro.pruebas_microbiologicas,
      rectificacion: registro.rectificacion,
      frecuencia: typeof registro.frecuencia === "string"
        ? JSON.parse(registro.frecuencia)
        : registro.frecuencia || {}
    };

    res.json(respuesta);
  } catch (error) {
    console.error("❌ Error al obtener frecuencia:", error);
    res.status(500).json({ msg: "Error interno." });
  }
};

// Crear nueva frecuencia
exports.crear = async (req, res) => {
  try {
    const nueva = await Frecuencia.create(req.body);
    res.status(201).json(nueva);
  } catch (error) {
    console.error("❌ Error al crear frecuencia:", error);
    res.status(500).json({ msg: "Error al crear frecuencia." });
  }
};

// Editar una frecuencia
exports.editar = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Frecuencia.update(req.body, { where: { id } });

    if (!updated) return res.status(404).json({ msg: "No encontrado" });

    const actualizado = await Frecuencia.findByPk(id);
    res.json(actualizado);
  } catch (error) {
    console.error("❌ Error al editar frecuencia:", error);
    res.status(500).json({ msg: "Error al editar frecuencia." });
  }
};

// Eliminar frecuencia
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Frecuencia.destroy({ where: { id } });

    if (!eliminado) return res.status(404).json({ msg: "No encontrado" });

    res.json({ msg: "Frecuencia eliminada correctamente." });
  } catch (error) {
    console.error("❌ Error al eliminar frecuencia:", error);
    res.status(500).json({ msg: "Error al eliminar frecuencia." });
  }
};

// Obtener todas las frecuencias visibles
exports.obtenerFrecuencias = async (req, res) => {
  try {
    const datos = await db.frecuencia_muestreo_producto.findAll({
      include: {
        model: db.productos,
        as: 'producto',
        attributes: ['nombre']
      },
      attributes: [
        'id', 'productoId', 'tipo_estudio',
        'ph', 'valoracion', 'particulas_visibles',
        'pruebas_microbiologicas', 'rectificacion',
        'aspecto', 'hermeticidad'
      ]
    });

    const resultado = datos.map(f => ({
      id: f.id,
      productoId: f.productoId,
      productoNombre: f.producto?.nombre || "Desconocido",
      tipo_estudio: f.tipo_estudio,
      ph: f.ph,
      valoracion: f.valoracion,
      particulas_visibles: f.particulas_visibles,
      pruebas_microbiologicas: f.pruebas_microbiologicas,
      rectificacion: f.rectificacion,
      aspecto: f.aspecto,
      hermeticidad: f.hermeticidad
    }));

    res.json(resultado);
  } catch (error) {
    console.error("❌ Error al obtener frecuencias:", error); // MOSTRAR ERROR REAL
    res.status(500).json({ msg: "Error interno.", error: error.message });
  }
};
