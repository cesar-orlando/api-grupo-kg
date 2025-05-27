import { Request, Response } from "express";
import { IAConfig } from "../models/iaConfig.model";
import { openai } from "../services/openai";
import { DynamicRecord } from "../models/record.model";
import { readRecordsByFilter } from "../tools/readRecordsByFilter";
import { ChatCompletionTool } from "openai/resources/chat";
import { generatePersonalityResponse } from "../tools/generatePersonalityResponse";

// 🔥 Crear configuración inicial si no existe
export const createIAConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;
    const {
      name = "Asistente",
      tone = "amigable",
      objective = "agendar",
      welcomeMessage = "¡Hola! ¿En qué puedo ayudarte?",
    } = req.body;

    const existing = await IAConfig.findOne({ clientId });
    if (existing) {
      res.status(400).json({ message: "Ya existe configuración para este cliente." });
      return;
    }

    const newConfig = new IAConfig({
      clientId,
      name,
      tone,
      objective,
      welcomeMessage,
      intents: [],
      customPrompt: "", // se puede autogenerar en frontend
    });

    await newConfig.save();
    res.status(201).json({ message: "Configuración creada", config: newConfig });
  } catch (error) {
    console.error("Error al crear configuración IA:", error);
    res.status(500).json({ message: "Error al crear configuración IA" });
  }
};

export const getIAConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;
    const config = await IAConfig.findOne({ clientId });

    if (!config) {
      res.status(404).json({ message: "Configuración no encontrada." });
      return;
    }

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la configuración." });
  }
};

export const updateIAConfig = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const update = req.body;

    const config = await IAConfig.findOneAndUpdate(
      { clientId },
      { ...update, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    console.log("config", config);

    res.json({ message: "Configuración actualizada", config });
  } catch (error) {
    res.status(500).json({ message: "Error al guardar la configuración." });
  }
};

// Funciones auxiliares
const getRecordsBySlug = async (slug: string) => {
  return await DynamicRecord.find({ tableSlug: slug }).lean();
};

export const testIAResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, messages } = req.body;

    const config = await IAConfig.findOne({ clientId });
    if (!config) {
      res.status(404).json({ message: "Configuración no encontrada." });
      return;
    }

    const lastUserMessage =
      messages
        ?.slice()
        .reverse()
        .find((m: any) => m.role === "user")?.content || "";

    const keywords = [
      "imagen",
      "foto",
      "fotos",
      "ver",
      "muestra",
      "visual",
      "tienes fotos",
      "quiero ver",
      "enséñame",
      "mándame",
      "mostrar",
    ];
    const lastLower = lastUserMessage.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const userWantsImages = keywords.some((k) => lastLower.includes(k.toLowerCase()));

    const systemPrompt = `${config.customPrompt}`;

    const fullMessages = [{ role: "system", content: systemPrompt }, ...(messages || [])];

    const responseAI = await generatePersonalityResponse(fullMessages);

    // Si no hubo tools, continuar flujo normal
    let reply: Promise<string> | string = responseAI;

    // Buscar imágenes si el usuario lo pidió
    let images: string[] = [];
    if (userWantsImages) {
      for (const intent of config.intents.filter((i) => i.type === "read")) {
        const records = await getRecordsBySlug(intent.tableSlug);
        for (const r of records) {
          for (const field of r.customFields || []) {
            if (field.type === "file") {
              if (Array.isArray(field.value)) {
                images.push(...field.value);
              } else if (field.value) {
                images.push(field.value);
              }
            }
          }
        }
      }

      images = images.filter(Boolean).slice(0, 5);

      if (images.length === 0) {
        reply = "Por ahora no tengo imágenes disponibles 😅, dame unos minutos y te las consigo.";
      }
    }

    console.log("reply --->", reply)

    res.json({ reply, files: images });
  } catch (error: any) {
    console.error("Error al probar IA:", error.response?.data || error.message || error);
    res.status(500).json({ message: "Error al probar la IA." });
  }
};
