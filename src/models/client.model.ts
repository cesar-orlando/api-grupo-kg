import mongoose from "mongoose";
import { customFieldSchema } from "./schema/customFieldSchema";

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  status: {
    type: Number,
    default: 1, // 1 = visible, 2 = oculto/eliminado
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  customFields: {
    type: [customFieldSchema],
    default: [],
  },
});

export const Client = mongoose.model("Client", ClientSchema);
