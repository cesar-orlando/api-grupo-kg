import { Router } from "express";
import { suggestIcons } from "../controllers/icons.controller";

const router = Router();

// Ruta para sugerir iconos usando OpenAI
router.post("/suggest-icons", suggestIcons);

export default router;
