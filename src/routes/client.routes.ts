import { Router } from "express";
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  addCustomField,
  removeCustomField,
  softDeleteClient,
  updateCustomFieldVisibility,
  updateCustomField,
  deleteCustomField,
  addFileToClientField,
  deleteFileFromClientField,
} from "../controllers/client.controller";
import multer from "multer";
import upload from "../middlewares/upload.middleware";

const router = Router();

router.get("/", getAllClients);
router.get("/:id", getClientById);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", softDeleteClient);
router.delete("/:id", deleteClient);
// 🔹 Ruta para agregar campo dinámico
router.post("/add-custom-field", addCustomField);
// 🔹 Ruta para eliminar campo dinámico
router.post("/remove-custom-field", removeCustomField);
// 🔹 Ruta para actualizar visibilidad de campo dinámico
router.post("/update-custom-fields-visibility", updateCustomFieldVisibility)
router.put("/update-custom-field/:key", updateCustomField);
router.delete("/delete-custom-field/:key", deleteCustomField);

//
router.post("/clients/:id/files/:fieldKey", upload.single("file"), addFileToClientField);
router.delete("/clients/:id/files/:fieldKey", deleteFileFromClientField);


export default router;
