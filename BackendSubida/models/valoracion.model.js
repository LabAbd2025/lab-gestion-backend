module.exports = (sequelize, DataTypes) => {
    const Valoracion = sequelize.define("valoraciones", {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      rango: {
        type: DataTypes.STRING,
        allowNull: false
      }
    });
    return Valoracion;
  };
  