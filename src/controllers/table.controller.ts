import { Request, Response } from "express";
import { Table } from "../models/table.model";
import { DynamicRecord } from "../models/record.model"; // Para crear el primer registro

// 🔹 Crear nueva tabla + primer DynamicRecord
export const createTable = async (req: Request, res: Response): Promise<void> => {
  console.log("si lo manda a llamar");
  try {
    const { name, slug, icon } = req.body;

    if (!name || !slug || !icon) {
      res.status(400).json({ message: "Nombre, icono y slug son requeridos." });
      return;
    }

    const existing = await Table.findOne({ slug });
    if (existing) {
      res.status(400).json({ message: "Ya existe una tabla con ese slug." });
      return;
    }

    console.log("pasa por aqui");

    const newTable = new Table({
      name,
      slug,
      icon,
    });
    console.log("newTable", newTable);

    await newTable.save();

    const newRecord = new DynamicRecord({
      tableSlug: slug,
      customFields: [
        {
          key: "name",
          label: "Nombre",
          value: "Nombre por defecto",
          type: "text",
          visible: true,
          required: true,
        },
      ],
    });

    await newRecord.save();

    res
      .status(201)
      .json({ message: "Tabla y primer registro creados exitosamente.", table: newTable, record: newRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la tabla y su primer registro." });
  }
};

// 🔹 Obtener todas las tablas
export const getAllTables = async (_req: Request, res: Response) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las tablas." });
  }
};

// 🔹 Obtener una tabla específica por slug
export const getTableBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const table = await Table.findOne({ slug });

    if (!table) {
      res.status(404).json({ message: "Tabla no encontrada." });
      return;
    }

    res.json(table);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la tabla." });
  }
};

// 🔹 Actualizar tabla con el id
export const updateTableById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log("id", id);
    const { name, slug, icon } = req.body;
    const table = await Table.findById(id);
    if (!table) {
      res.status(404).json({ message: "Tabla no encontrada." });
      return;
    }
    const oldSlug = table.slug; // Guardamos el slug anterior por si cambia
    if (name) table.name = name;
    if (slug) table.slug = slug;
    if (icon) table.icon = icon;
    await table.save();
    // 🔥 Si el slug cambió, también actualizamos todos los DynamicRecords
    console.log("oldSlug", oldSlug);
    console.log("slug", slug);
    if (slug && oldSlug !== slug) {
      await DynamicRecord.updateMany({ tableSlug: oldSlug }, { $set: { tableSlug: slug } });
    }
    res.json({ message: "Tabla actualizada correctamente.", table });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la tabla." });
  }
};

// 🔥 Eliminar tabla y sus registros por el id
export const deleteTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const table = await Table.findByIdAndDelete(id);

    if (!table) {
      res.status(404).json({ message: "Tabla no encontrada para eliminar." });
      return;
    }

    // 🔥 También eliminamos todos los registros relacionados
    await DynamicRecord.deleteMany({ tableSlug: table.slug });

    res.json({ message: "Tabla y sus registros eliminados correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la tabla." });
  }
};
