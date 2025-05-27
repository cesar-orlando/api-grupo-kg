import express from "express";
import {
  getIAConfig,
  updateIAConfig,
  testIAResponse,
  createIAConfig,
} from "../controllers/iaConfig.controller";

const router = express.Router();

router.post("/test", testIAResponse); // para simular respuestas
router.post("/create/:clientId", createIAConfig);
router.get("/:clientId", getIAConfig);
router.post("/:clientId", updateIAConfig);

export default router;
