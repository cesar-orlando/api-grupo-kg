import mongoose from "mongoose";

const TableSchema = new mongoose.Schema({
  name: { type: String, required: true },         // Ej: "Propiedades"
  slug: { type: String, required: true, unique: true }, // Ej: "propiedades"
  icon: { type: String }, // Ej: "home"
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Table = mongoose.model('Table', TableSchema);
