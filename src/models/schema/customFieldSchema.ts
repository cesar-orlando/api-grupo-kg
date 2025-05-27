import mongoose from "mongoose";

export const customFieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    visible: { type: Boolean, default: true },
    type: { type: String, enum: ["text", "select", "number", "file"], default: "text" },
    options: { type: [String], default: [] },
    required: { type: Boolean, default: false },
    format: { type: String, enum: ["default", "currency"], default: "default" },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);
