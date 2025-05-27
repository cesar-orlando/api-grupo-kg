import { Router } from "express";
import { createTable, getAllTables, getTableBySlug, deleteTable, updateTableById } from "../controllers/table.controller";

const router = Router();

// Crear nueva tabla
router.post("/create", createTable);

// Listar todas las tablas
router.get("/list", getAllTables);

// Obtener tabla específica
router.get("/:slug", getTableBySlug);

// Actualizar tabla con id
router.put("/update/:id", updateTableById);

// Eliminar tabla
router.delete("/delete/:id", deleteTable);

export default router;
