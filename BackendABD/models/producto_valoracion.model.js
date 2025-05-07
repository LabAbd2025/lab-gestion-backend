module.exports = (sequelize, DataTypes) => {
    const ProductoValoracion = sequelize.define("producto_valoracion", {}, { timestamps: false });
    return ProductoValoracion;
  };