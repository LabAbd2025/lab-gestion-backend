module.exports = (sequelize, DataTypes) => {
    const VolumenProducto = sequelize.define("volumenes_producto", {
      cantidad: { type: DataTypes.FLOAT, allowNull: false },
      unidad: { type: DataTypes.STRING, allowNull: false },
      observacion: { type: DataTypes.STRING },
      productoId: { type: DataTypes.INTEGER, allowNull: false },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });
  
    return VolumenProducto;
  };
  