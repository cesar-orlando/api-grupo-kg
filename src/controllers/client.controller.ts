import { Request, Response } from "express";
import { Client } from "../models/client.model";

// 🔹 Obtener todos los clientes
export const getAllClients = async (_req: Request, res: Response): Promise<void> => {
  const clients = await Client.find({ status: 1 });
  res.json(clients);
};

// 🔹 Obtener cliente por ID
export const getClientById = async (req: Request, res: Response): Promise<void> => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    res.status(404).json({ message: "Cliente no encontrado" })
    return
  }
  res.json(client);
};

// 🔹 Crear cliente nuevo
export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, customFields } = req.body;

    const normalizedFields = (customFields || []).map((field: any) => ({
      ...field,
      value: field.value !== undefined
        ? field.value
        : field.type === "file"
        ? []
        : "",
    }));

    const client = new Client({
      name,
      phone,
      customFields: normalizedFields,
    });

    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: "Error al crear cliente", error });
  }
};

// 🔹 Actualizar cliente
export const updateClient = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, phone, customFields } = req.body;

  const client = await Client.findById(id);
  if (!client) {
    res.status(404).json({ message: "Cliente no encontrado" })
    return
  }

  client.name = name;
  client.phone = phone;
  client.customFields = customFields;

  await client.save();
  res.json(client);
};

// Eliminar cliente con status a 2
export const softDeleteClient = async (req: Request, res: Response) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, { status: 2 });
    res.json({ message: "Cliente ocultado con éxito" });
  } catch (err) {
    res.status(500).json({ message: "Error al ocultar cliente" });
  }
};


// 🔹 Eliminar cliente
export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await Client.findByIdAndDelete(id);
  res.json({ message: "Cliente eliminado" });
};

// 🔹 Agregar campo dinámico a todos los clientes
export const addCustomField = async (req: Request, res: Response): Promise<void> => {
  const { key, label, type = "text", options = [] } = req.body;

  if (!key || typeof key !== "string" || key.trim() === "") {
    res.status(400).json({ message: "La clave del campo es inválida." });
    return;
  }

  try {
    const clientes = await Client.find({
      customFields: { $not: { $elemMatch: { key } } }, // Solo clientes que no tienen el campo
    });

    let updatedCount = 0;

    
    for (const cliente of clientes) {
      const fieldValue = type === "file" ? [] : "";
      cliente.customFields.push({
        key,
        label,
        value: fieldValue,
        visible: true,
        type,
        options: type === "select" ? options : [],
      });
      await cliente.save();
      updatedCount++;
    }

    res.json({
      message: `Campo '${label}' agregado a ${updatedCount} clientes.`,
    });
  } catch (error) {
    console.error("❌ Error al agregar campo dinámico:", error);
    res.status(500).json({ message: "Error interno al agregar campo dinámico." });
  }
};

// Eliminar campo dinámico de todos los clientes
export const removeCustomField = async (req: Request, res: Response): Promise<void> => {
  const { fieldName } = req.body;

  if (!fieldName || typeof fieldName !== "string" || fieldName.trim() === "") {
    res.status(400).json({ message: "El nombre del campo es inválido." });
    return;
  }

  try {
    const result = await Client.updateMany(
      { "customFields.key": fieldName },
      {
        $pull: {
          customFields: { key: fieldName },
        },
      }
    );

    console.log("Resultado de eliminación:", result);

    res.json({
      message: `Campo '${fieldName}' eliminado de ${result.modifiedCount ?? "varios"} clientes.`,
    });
  } catch (error) {
    console.error("❌ Error al eliminar campo dinámico:", error);
    res.status(500).json({ message: "Error interno." });
  }
};

// POST /customers/update-custom-fields-visibility
export const updateCustomFieldVisibility = async (req: Request, res: Response) => {
  const { fields } = req.body;

  try {
    for (const { key, visible } of fields) {
      await Client.updateMany(
        { "customFields.key": key },
        { $set: { "customFields.$[elem].visible": visible } },
        { arrayFilters: [{ "elem.key": key }] } // Asegura que solo se actualice el campo correcto
      );
    }

    res.json({ message: "Campos actualizados" });
  } catch (err) {
    console.error("❌ Error actualizando visibilidad:", err);
    res.status(500).json({ message: "Error actualizando visibilidad" });
  }
};

// 🔹 Actualizar visibilidad de campo dinámico
export const updateCustomField = async (req: Request, res: Response) => {
  const { key } = req.params;
  const { label, type, options } = req.body;

  try {
    const clientes = await Client.find({ "customFields.key": key });

    for (const cliente of clientes) {
      const field = cliente.customFields.find((f) => f.key === key);
      if (field) {
        if (label !== undefined) field.label = label; // Solo actualiza si se proporciona
        if (type !== undefined) field.type = type;
        if (type === "select" && options !== undefined) {
          field.options = options;
        }
      }
      await cliente.save();
    }

    res.json({ message: `Campo '${key}' actualizado en ${clientes.length} clientes.` });
  } catch (err) {
    console.error("❌ Error al actualizar campo:", err);
    res.status(500).json({ message: "Error al actualizar campo dinámico." });
  }
};

// 🔹 Eliminar campo dinámico de todos los clientes
export const deleteCustomField = async (req: Request, res: Response) => {
  const { key } = req.params;

  try {
    const clientes = await Client.find({ "customFields.key": key });

    for (const cliente of clientes) {
      cliente.customFields.pull({ key });
      await cliente.save();
    }

    res.json({ message: `Campo '${key}' eliminado de ${clientes.length} clientes.` });
  } catch (err) {
    console.error("❌ Error al eliminar campo:", err);
    res.status(500).json({ message: "Error al eliminar campo dinámico." });
  }
};

// controllers/client.controller.ts
export const addFileToClientField = async (req: Request, res: Response): Promise<void> => {
  const { id, fieldKey } = req.params;

  if (!req.file) {
    res.status(400).json({ message: "No se subió ningún archivo" });
    return;
  }

  const file = req.file as Express.MulterS3.File;

  const client = await Client.findById(id);
  if (!client) {
    res.status(404).json({ message: "Cliente no encontrado" });
    return;
  }

  const field = client.customFields.find(f => f.key === fieldKey);

  if (!field || field.type !== 'file') {
    res.status(400).json({ message: "Campo no encontrado o no es de tipo archivo" });
    return;
  }

  if (!Array.isArray(field.value)) field.value = [];

  field.value.push(file.location);
  await client.save();

  res.status(200).json({ message: "Archivo agregado", url: file.location });
};

export const deleteFileFromClientField = async (req: Request, res: Response): Promise<void> => {
  const { id, fieldKey } = req.params;
  const { fileUrl } = req.body;

  const client = await Client.findById(id);
  if (!client) {
    res.status(404).json({ message: "Cliente no encontrado" });
    return;
  }

  const field = client.customFields.find(f => f.key === fieldKey);
  if (!field || field.type !== 'file' || !Array.isArray(field.value)) {
    res.status(400).json({ message: "Campo no válido" });
    return;
  }

  field.value = field.value.filter((url: string) => url !== fileUrl);
  await client.save();

  res.status(200).json({ message: "Archivo eliminado" });
};






