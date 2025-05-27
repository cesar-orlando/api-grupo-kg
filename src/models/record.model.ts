import mongoose from "mongoose";
import { customFieldSchema } from "./schema/customFieldSchema";

// 🔹 Esquema principal para un registro dinámico
const DynamicRecordSchema = new mongoose.Schema({
  tableSlug: { type: String, required: true }, // Relación a qué tabla pertenece
  customFields: {
    type: [customFieldSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const DynamicRecord = mongoose.model('DynamicRecord', DynamicRecordSchema);
