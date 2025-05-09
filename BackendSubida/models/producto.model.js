module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define("productos", {
    nombre: { type: DataTypes.STRING, allowNull: false },
    lote: { type: DataTypes.STRING },
    envase: { type: DataTypes.STRING },
    volumenCantidad: { type: DataTypes.FLOAT },
    volumenUnidad: { type: DataTypes.STRING },
    hermeticidad: { type: DataTypes.STRING },
    aspecto: { type: DataTypes.TEXT },
    phMin: { type: DataTypes.FLOAT },
    phMax: { type: DataTypes.FLOAT },
    conductividad: { type: DataTypes.STRING },
    impurezas: { type: DataTypes.STRING },
    particulas: { type: DataTypes.FLOAT },
    recuentoMicrobianoMin: { type: DataTypes.INTEGER },
    recuentoMicrobianoMax: { type: DataTypes.INTEGER },
    esterilidad: { type: DataTypes.STRING },
    endotoxinas: { type: DataTypes.STRING },
    observaciones: { type: DataTypes.TEXT },
    referenciaDocumental: { type: DataTypes.TEXT },
    fechaAnalisis: { type: DataTypes.DATE },
    otros_datos: { type: DataTypes.JSON },
    formaFarmaceuticaId: { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });

  return Producto;
};
