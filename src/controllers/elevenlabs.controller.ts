import { Request, Response } from "express";
import { createRecord } from "./record.controller";

export const logLead = async (req: Request, res: Response) => {
  try {
    req.body = {
      tableSlug: "leads_llamadas",
      customFields: [
        { key: "nombre", value: req.body.nombre },
        { key: "telefono", value: req.body.telefono },
        { key: "interes", value: req.body.interes },
        { key: "zona", value: req.body.zona },
      ],
    };

    await createRecord(req, res);

    res.status(200).json({ message: "Lead guardado en tabla dinámica." });
    return;
  } catch (error) {
    console.error("❌ Error al registrar lead:", error);
    res.status(500).json({ message: "Error al guardar el lead" });
    return;
  }
};
