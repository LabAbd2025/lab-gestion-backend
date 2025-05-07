const db = require("../models");
const Protocolo = db.protocolos_estudio;

exports.generarCodigoProtocolo = async (req, res) => {
  try {
    const ultimo = await Protocolo.findOne({ order: [['createdAt', 'DESC']] });

    let nuevoCodigo = "PROT-001";
    if (ultimo && ultimo.codigo) {
      const numeroActual = parseInt(ultimo.codigo.split("-")[1]);
      const siguienteNumero = (numeroActual + 1).toString().padStart(3, "0");
      nuevoCodigo = `PROT-${siguienteNumero}`;
    }

    res.json({ codigo: nuevoCodigo });
  } catch (error) {
    console.error("Error al generar código:", error);
    res.status(500).json({ msg: "Error al generar código", error });
  }
};

exports.crearProtocolo = async (req, res) => {
  try {
    const nuevo = await Protocolo.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    console.error("Error al crear protocolo:", error);
    res.status(500).json({ msg: "Error al crear protocolo", error });
  }
};
