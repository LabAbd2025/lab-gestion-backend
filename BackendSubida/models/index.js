const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Modelos
db.usuarios = require("./usuario.model.js")(sequelize, Sequelize);
db.productos = require("./producto.model.js")(sequelize, Sequelize);
db.auth_tokens = require("./auth_token.model.js")(sequelize, Sequelize);
db.protocolos_estudio = require("./protocolo_estudio.model.js")(sequelize, Sequelize);
db.forma_farmaceutica = require("./forma_Farmaceutica.model.js")(sequelize, Sequelize);
db.clasificacion_pa = require("./clasificacion_pa.model.js")(sequelize, Sequelize);
db.frecuencia_muestreo_base = require("./frecuencia_muestreo_base.model.js")(sequelize, Sequelize);
db.frecuencia_muestreo_producto = require("./frecuencia_muestreo_producto.model.js")(sequelize, Sequelize);
db.formula_cuali_cuantitativa = require("./formula_cuali_cuantitativa.model.js")(sequelize, Sequelize);
db.materias_primas = require("./materia_prima.model.js")(sequelize, Sequelize);
db.valoraciones = require("./valoracion.model.js")(sequelize, Sequelize);
db.producto_valoracion = require("./producto_valoracion.model.js")(sequelize, Sequelize);
db.volumenes_producto = require("./volumen_producto.model.js")(sequelize, Sequelize);

// Relación Usuario - AuthToken
db.usuarios.hasMany(db.auth_tokens, { as: "tokens", foreignKey: "usuarioId" });
db.auth_tokens.belongsTo(db.usuarios, { foreignKey: "usuarioId", as: "usuario" });

// Relación Producto - Protocolo Estudio
db.productos.hasMany(db.protocolos_estudio, { foreignKey: "productoId", as: "protocolos" });
db.protocolos_estudio.belongsTo(db.productos, { foreignKey: "productoId", as: "producto" });

// Relación Forma Farmacéutica - Producto
db.forma_farmaceutica.hasMany(db.productos, { foreignKey: "formaFarmaceuticaId", as: "productos" });
db.productos.belongsTo(db.forma_farmaceutica, { foreignKey: "formaFarmaceuticaId", as: "formaFarmaceutica" });

// Relación Formula ↔ Materias Primas
db.formula_cuali_cuantitativa.hasMany(db.materias_primas, { foreignKey: "formulaId", as: "materiasPrimas" });
db.materias_primas.belongsTo(db.formula_cuali_cuantitativa, { foreignKey: "formulaId", as: "formula" });

// RELACIÓN MUCHOS A MUCHOS: Producto ↔ Valoración
db.productos.belongsToMany(db.valoraciones, {
  through: db.producto_valoracion,
  as: "valoraciones",
  foreignKey: "productoId"
});
db.valoraciones.belongsToMany(db.productos, {
  through: db.producto_valoracion,
  as: "productos",
  foreignKey: "valoracionId"
});

// Relación Producto ↔ Frecuencia Muestreo Producto
db.productos.hasMany(db.frecuencia_muestreo_producto, { foreignKey: "productoId", as: "frecuencias" });
db.frecuencia_muestreo_producto.belongsTo(db.productos, { foreignKey: "productoId", as: "producto" });

// ✅ Relación Producto ↔ Volúmenes Producto
db.productos.hasMany(db.volumenes_producto, { foreignKey: "productoId", as: "volumenes" });
db.volumenes_producto.belongsTo(db.productos, { foreignKey: "productoId", as: "producto" });

// ✅ Relación Volumen ↔ Frecuencia Muestreo Producto (nueva)
db.volumenes_producto.hasMany(db.frecuencia_muestreo_producto, { foreignKey: "volumenId", as: "frecuencias" });
db.frecuencia_muestreo_producto.belongsTo(db.volumenes_producto, { foreignKey: "volumenId", as: "volumen" });

// Ejecutar asociaciones definidas en los modelos (por si algún modelo las tiene)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
