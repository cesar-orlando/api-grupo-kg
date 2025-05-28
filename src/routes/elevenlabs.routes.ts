import express from "express";
import { logLead } from "../controllers/elevenlabs.controller";

const router = express.Router();

router.post("/log-lead", logLead);

export default router;