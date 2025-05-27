import { Request, Response } from "express";
import { openai } from "../services/openai";

export const suggestIcons = async (req: Request, res: Response): Promise<void> => {
  const { tableName } = req.body;

  if (!tableName) {
    res.status(400).json({ message: "Missing table name" });
    return;
  }

  try {
    const prompt = `Sugiere 5 emojis para representar "${tableName}" junto con una palabra breve de descripción. Responde uno por línea en formato: emoji espacio nombre. Ejemplo: 🏠 Casa`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const text = completion.choices[0].message?.content || "";

    const icons = text
      .split("\n")
      .map((line) => {
        const parts = line.trim().split(/\s+/, 2); // separa emoji y nombre
        if (parts.length === 2) {
          return { emoji: parts[0], label: parts[1] };
        }
        return null;
      })
      .filter((item) => item !== null);

    res.json({ icons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching icons" });
  }
};
