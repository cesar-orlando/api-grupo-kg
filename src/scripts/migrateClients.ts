import mongoose from "mongoose";
import { Client } from "../models/client.model";
import dotenv from "dotenv";
dotenv.config();

const SELECT_FIELDS: {
  [key: string]: string[];
} = {
  purchasingPower: ["Bajo", "Medio", "Alto"],
  paymentType: ["Efectivo", "Bancario", "Institucional"],
  institution: ["infonavit", "fovissste", "cfe", "pensiones del estado"],
  propertyType: ["terreno", "casa"],
  intent: ["comprar", "rentar"],
  rento: ["Si", "No"],
  compro: ["Si", "No"],
};

const FORCE_OVERWRITE = true;

const startMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ Conectado a MongoDB");

    const clientes = await Client.find();

    for (const cliente of clientes) {
      let modified = false;
    
      console.log(`\n📄 Cliente: ${cliente.name}`);
    
      const updatedFields = cliente.customFields.map((field: any) => {
        const updatedField = { ...field };
    
        console.log(`🔍 Revisando campo: ${field.key} (type actual: ${field.type})`);
    
        if (!field.type || FORCE_OVERWRITE) { 
          if (SELECT_FIELDS[field.key]) {
            updatedField.type = "select";
            updatedField.options = SELECT_FIELDS[field.key];
            modified = true;
            console.log(`✅ Campo "${field.key}" marcado como SELECT con opciones:`, updatedField.options);
          } else {
            updatedField.type = "text";
            updatedField.options = [];
            modified = true;
            console.log(`📝 Campo "${field.key}" marcado como TEXT`);
          }
        } else {
          console.log(`⏭️ Ya tenía type: ${field.type}, no se modifica`);
        }
    
        return updatedField;
      });
    
      if (modified) {
        cliente.set("customFields", updatedFields);
        await cliente.save();
        console.log(`💾 Cliente ${cliente.name} guardado con cambios.`);
      } else {
        console.log(`🟡 Cliente ${cliente.name} no necesitó cambios.`);
      }
    }
    

    console.log("🚀 Migración completada.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    process.exit(1);
  }
};

startMigration();
