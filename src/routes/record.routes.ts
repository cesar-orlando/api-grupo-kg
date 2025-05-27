import { Router } from "express";
import { createRecord, getRecordsByTable, updateRecord, deleteRecord, addCustomField, updateCustomField, deleteCustomField } from "../controllers/record.controller";

const router = Router();

// Crear nuevo registro
router.post("/create", createRecord);

router.post("/add-custom-field/:slug", addCustomField);
router.put("/update-custom-field/:slug/:key", updateCustomField);
router.delete("/delete-custom-field/:slug/:key", deleteCustomField);

// Obtener registros por tabla
router.get("/:tableSlug", getRecordsByTable);

// Actualizar registro
router.put("/update/:id", updateRecord);

// Eliminar registro
router.delete("/delete/:id", deleteRecord);

export default router;
