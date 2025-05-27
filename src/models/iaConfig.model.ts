import mongoose from "mongoose";

const IAIntentSchema = new mongoose.Schema({
  type: { type: String, enum: ["read", "write"], required: true },
  intent: { type: String, required: true },
  tableSlug: { type: String, required: true },
}, { _id: false });

const IAConfigSchema = new mongoose.Schema({
  clientId: { type: String, required: true, unique: true },
  name: { type: String, default: "Asistente" },
  objective: { type: String, enum: ["agendar", "responder", "recomendar", "ventas", "soporte"], default: "agendar" },
  tone: { type: String, enum: ["formal", "amigable", "persuasivo"], default: "amigable" },
  welcomeMessage: { type: String, default: "¡Hola! ¿En qué puedo ayudarte hoy?" },
  intents: { type: [IAIntentSchema], default: [] },
  dataTemplate: { type: String, default: "{{label}}: {{value}}" },
  customPrompt: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});

export const IAConfig = mongoose.model("IAConfig", IAConfigSchema);