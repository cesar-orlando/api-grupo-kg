import { Request, Response } from "express";
import { DynamicRecord } from "../models/record.model";

// 🔹 Agregar un campo dinámico a todos los registros de una tabla
export const addCustomField = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { key, label, type, options, format } = req.body;

    if (!key || !label) {
      res.status(400).json({ message: "Faltan datos del campo." });
      return;
    }

    const newField = {
      key,
      label,
      type: type || "text",
      options: options || [],
      visible: true,
      value: "",
      format: format || "default",
    };

    await DynamicRecord.updateMany({ tableSlug: slug }, { $push: { customFields: newField } });

    res.json({ message: "Campo agregado exitosamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al agregar campo." });
  }
};

// 🔹 Actualizar un campo dinámico (nombre, tipo, opciones)
export const updateCustomField = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug, key } = req.params;
    const { label, type, options, format } = req.body;

    const records = await DynamicRecord.find({ tableSlug: slug });

    for (const record of records) {
      const field = record.customFields.find((f: any) => f.key === key);
      if (field) {
        if (label) field.label = label;
        if (type) field.type = type;
        if (options) field.options = options;
        if (format) field.format = format;
      }
      await record.save();
    }

    res.json({ message: "Campo actualizado correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar campo." });
  }
};

// 🔹 Eliminar un campo dinámico
export const deleteCustomField = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug, key } = req.params;

    const records = await DynamicRecord.find({ tableSlug: slug });

    if (!records.length) {
      res.status(404).json({ message: "No existen registros en esta tabla." });
      return;
    }

    // 🔥 Revisamos en el primer registro si sería el último campo
    const firstRecord = records[0];
    const fieldsLeft = firstRecord.customFields.filter((f: any) => f.key !== key);

    if (fieldsLeft.length === 0) {
      res.status(400).json({ message: "No puedes eliminar el único campo de la tabla." });
      return;
    }

    // 🔥 Si pasa validación, sí eliminamos el campo
    await DynamicRecord.updateMany(
      { tableSlug: slug },
      { $pull: { customFields: { key } } }
    );

    res.json({ message: "Campo eliminado exitosamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar campo." });
  }
};

// 🔹 Crear nuevo registro dinámico
export const createRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableSlug, customFields } = req.body;

    if (!tableSlug || !Array.isArray(customFields)) {
      res.status(400).json({ message: "tableSlug y customFields son requeridos." });
      return;
    }

    const newRecord = new DynamicRecord({
      tableSlug,
      customFields,
    });

    await newRecord.save();

    res.status(201).json(newRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el registro." });
  }
};

// 🔹 Obtener todos los registros de una tabla específica
export const getRecordsByTable = async (req: Request, res: Response) => {
  try {
    const { tableSlug } = req.params;

    const records = await DynamicRecord.find({ tableSlug });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los registros." });
  }
};

// 🔹 Actualizar registro dinámico
export const updateRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { customFields } = req.body;

    if (!Array.isArray(customFields)) {
      res.status(400).json({ message: "customFields debe ser un arreglo." });
      return;
    }

    const record = await DynamicRecord.findById(id);

    if (!record) {
      res.status(404).json({ message: "Registro no encontrado." });
      return;
    }

    // 🔥 Actualizamos TODO customFields reemplazándolo
    record.set("customFields", customFields);

    await record.save();

    res.json({ message: "Registro actualizado correctamente.", record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el registro." });
  }
};

// 🔹 Eliminar registro dinámico
export const deleteRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const record = await DynamicRecord.findByIdAndDelete(id);

    if (!record) {
      res.status(404).json({ message: "Registro no encontrado para eliminar." });
      return;
    }

    res.json({ message: "Registro eliminado correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el registro." });
  }
};
