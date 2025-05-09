module.exports = (sequelize, DataTypes) => {
  const FrecuenciaMuestreoProducto = sequelize.define("frecuencia_muestreo_producto", {
    tipo_estudio: {
      type: DataTypes.ENUM(
        "ESTABILIDAD NATURAL (ESTABLE)",
        "ESTABILIDAD ACELERADA (ESTABLE)",
        "ESTABILIDAD ON GOING (ESTABLE)",
        "ESTUDIO DE EXCURSIÓN (ESTABLE)",
        "ESTABILIDAD NATURAL (MENOS ESTABLE)",
        "ESTABILIDAD ACELERADA (MENOS ESTABLE)",
        "ESTABILIDAD ON GOING (MENOS ESTABLE)",
        "ESTUDIO DE EXCURSIÓN (MENOS ESTABLE)"
      ),
      allowNull: true,
    },
    aspecto: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hermeticidad: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ph: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    valoracion: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    particulas_visibles: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pruebas_microbiologicas: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rectificacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    frecuencia: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id',
      }
    },
    volumenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'volumenes_producto',
        key: 'id',
      }
    }
  });

  return FrecuenciaMuestreoProducto;
};
