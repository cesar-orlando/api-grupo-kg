// src/scripts/migrateAddStatus.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { DynamicRecord } from "../models/record.model";

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("✅ Conectado a MongoDB");

    const propiedades = await DynamicRecord.find({ tableSlug: "propiedades" });
    console.log(`📦 Registros encontrados: ${propiedades.length}`);

    for (const record of propiedades) {
      let actualizado = false;

      for (const field of record.customFields) {
        // Rellenar ciudad si está vacía
        if (field.key === "ciudad" && (!field.value || field.value === "")) {
          field.value = "Uruapan";
          actualizado = true;
        }

        // Rellenar estado si está vacío
        if (field.key === "estado" && (!field.value || field.value === "")) {
          field.value = "Michoacán";
          actualizado = true;
        }
      }

      if (actualizado) {
        await record.save();
        console.log(`✅ Registro ${record._id} actualizado`);
      }
    }

    console.log("🏁 Migración finalizada");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    process.exit(1);
  }
}

main();
