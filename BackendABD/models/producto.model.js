module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define("productos", {
    nombre: { type: DataTypes.STRING, allowNull: false },
    lote: { type: DataTypes.STRING },
    envase: { type: DataTypes.STRING },
    volumenCantidad: { type: DataTypes.FLOAT },         
    volumenUnidad: { type: DataTypes.STRING },          
    hermeticidad: { type: DataTypes.STRING },
    aspecto: { type: DataTypes.TEXT },
    ph_min: { type: DataTypes.FLOAT },
    ph_max: { type: DataTypes.FLOAT },
    conductividad: { type: DataTypes.STRING },
    impurezas: { type: DataTypes.STRING },
    particulas: { type: DataTypes.FLOAT },
    recuentoMicrobiano_min: { type: DataTypes.INTEGER },
    recuentoMicrobiano_max: { type: DataTypes.INTEGER },
    esterilidad: { type: DataTypes.STRING },
    endotoxinas: { type: DataTypes.STRING },
    observaciones: { type: DataTypes.TEXT },
    referencia_documental: { type: DataTypes.TEXT },
    fechaAnalisis: { type: DataTypes.DATE },
    otros_datos: { type: DataTypes.JSON },
    formaFarmaceuticaId: { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });

  return Producto;
};
